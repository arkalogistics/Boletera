// pages/api/checkout.ts
import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabaseClient";

/**
 * Montos en centavos obtenidos de tus Price IDs:
 * - GENERAL:   35000  (MXN $350.00)
 * - VIP:       38000  (MXN $380.00)
 * - PREFERENTE:36000  (MXN $360.00)
 */
function getAmountByRow(row: string): number {
  const r = row.toUpperCase();
  if (r === "A") return 38000;       // VIP
  if (r === "B" || r === "C") return 36000; // PREFERENTE
  return 35000;                      // GENERAL
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  interface Body {
    eventId: string;
    seats: string[];
    userEmail: string;
  }
  const { eventId, seats, userEmail } = req.body as Body;

  // ───────── Validaciones ─────────
  if (
    typeof eventId !== "string" ||
    !Array.isArray(seats) ||
    seats.length === 0 ||
    typeof userEmail !== "string" ||
    !userEmail.includes("@")
  ) {
    return res.status(400).json({ error: "Datos incompletos o inválidos." });
  }

  try {
    // ─── 1) Construir line_items usando price_data con unit_amount dinámico ──
    const line_items = seats.map((seatId) => {
      const [row, col] = seatId.split("-");
      const unit_amount = getAmountByRow(row);

      return {
        price_data: {
          currency: "mxn",
          product_data: {
            name: `Butaca ${seatId}`, // Ej: "Butaca A-5"
            description:
              row.toUpperCase() === "A"
                ? "Zona VIP"
                : row.toUpperCase() === "B" || row.toUpperCase() === "C"
                ? "Zona Preferente"
                : "Zona General",
          },
          unit_amount,
        },
        quantity: 1,
      };
    });

    // ─── 2) Crear sesión de Stripe Checkout ───────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`,
    });

    // ─── 3) Guardar la orden en Supabase (paid = false) ────────────────────────
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          event_id: eventId,
          user_email: userEmail,
          stripe_session: session.id,
          paid: false,
        },
      ])
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Error al crear la orden en Supabase:", orderError);
      return res.status(500).json({ error: "Error al crear la orden." });
    }

    // ─── 4) Insertar cada asiento en order_items ───────────────────────────────
    await Promise.all(
      seats.map((seatId) =>
        supabase.from("order_items").insert({
          order_id: order.id,
          seat_id: seatId,
        })
      )
    );

    // ─── 5) Devolver la URL de la sesión de Stripe Checkout ───────────────────
    return res.status(200).json({ sessionUrl: session.url });
  } catch (err) {
    console.error("Error en /api/checkout:", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
