// pages/api/tickets/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { sendTicketEmail } from "../../../lib/email";

type Data =
  | { success: true; tokens: string[] }
  | { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }

  const { sessionId } = req.body as { sessionId: string };
  if (!sessionId) {
    return res
      .status(400)
      .json({ success: false, error: "Falta sessionId en la petición." });
  }

  try {
    // 1) BUSCAR LA ORDEN (order_id + user_email)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_email, event_id")
      .eq("stripe_session", sessionId)
      .single();

    if (orderError || !order) {
      return res
        .status(404)
        .json({ success: false, error: "Orden no encontrada." });
    }
    const orderId = order.id;
    const userEmail = order.user_email;
    const eventId = order.event_id;

    // 2) LEER TODOS LOS asientos DE order_items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("seat_id")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error leyendo order_items:", itemsError);
      return res
        .status(500)
        .json({ success: false, error: "Error interno al obtener asientos." });
    }
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No hay asientos en esta orden." });
    }

    // 3) POR CADA asiento, generamos un token y guardamos (order_id, seat_id, token, used)
    const tokens: string[] = [];
    for (const { seat_id } of items) {
      const newToken = uuidv4();
      const { data: ticketRow, error: insertError } = await supabase
        .from("tickets")
        .insert([
          {
            order_id: orderId,
            seat_id,      // ← aquí almacenamos "A-5", "K-14", etc.
            token: newToken,
            used: false,
          },
        ])
        .select("token")
        .single();

      if (insertError || !ticketRow) {
        console.error("Error creando ticket para asiento:", seat_id, insertError);
        return res
          .status(500)
          .json({ success: false, error: "Error interno al crear ticket." });
      }
      tokens.push(ticketRow.token);
    }

    // 4) ENVIAR EL CORREO, ahora con enlaces (no imágenes QR embebidas).
    try {
      await sendTicketEmail({ to: userEmail, tokens });
    } catch (emailErr) {
      console.error("Error enviando correo de boletos:", emailErr);
      // No abortamos: los tickets ya se guardaron en BD; solo logueamos el error.
    }

    // 5) DEVOLVER AL FRONT-END el arreglo de tokens (opcional)
    return res.status(200).json({ success: true, tokens });
  } catch (err) {
    console.error("Error en /api/tickets/create:", err);
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor." });
  }
}
