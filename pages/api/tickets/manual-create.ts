// pages/api/tickets/manual-create.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { sendTicketEmail } from "../../../lib/email"; // Ajusta si tu función está en otro lado

type Data =
  | { success: true; tokens: string[] }
  | { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { eventId, seats, buyer, userEmail } = req.body as {
    eventId: string;
    seats: string[];
    buyer: string;
    userEmail?: string;
  };

  if (!eventId || !seats?.length || !buyer) {
    return res.status(400).json({ success: false, error: "Faltan datos obligatorios." });
  }

  try {
    // 1. Crear una orden manual
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          event_id: eventId,
          user_email: userEmail || null,
         
        // Asume que tienes este campo. Si no, quítalo.
          created_at: new Date().toISOString(),
        },
      ])
      .select("id, user_email")
      .single();

    if (orderError || !order) {
      console.error("Error insertando orden manual:", orderError);
      return res.status(500).json({ success: false, error: "No se pudo crear la orden manual." });
    }

    const orderId = order.id;
    const userEmailFinal = order.user_email;

    // 2. Insertar asientos a order_items
    const orderItems = seats.map((seatId) => ({
      order_id: orderId,
      seat_id: seatId,
    }));
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Error insertando order_items:", orderItemsError);
      return res.status(500).json({ success: false, error: "No se pudo asignar butacas a la orden." });
    }

    // 3. Insertar boletos en tickets
    const tokens: string[] = [];
    for (const seatId of seats) {
      const token = uuidv4();
      const { data: ticketRow, error: ticketError } = await supabase
        .from("tickets")
        .insert([
          {
            order_id: orderId,
            seat_id: seatId,
            token,
            used: false,
          },
        ])
        .select("token")
        .single();

      if (ticketError || !ticketRow) {
        console.error("Error creando ticket para asiento", seatId, ticketError);
        return res.status(500).json({
          success: false,
          error: `No se pudo crear el boleto para la butaca ${seatId}`,
        });
      }
      tokens.push(ticketRow.token);
    }

    // 4. Mandar email si hay correo
    if (userEmailFinal) {
      try {
        await sendTicketEmail({ to: userEmailFinal, tokens });
      } catch (emailErr) {
        console.error("Error enviando correo:", emailErr);
        // No abortar por error de correo
      }
    }

    // 5. Listo
    return res.status(200).json({ success: true, tokens });
  } catch (err) {
    console.error("Error inesperado:", err);
    return res.status(500).json({ success: false, error: "Error interno del servidor." });
  }
}
