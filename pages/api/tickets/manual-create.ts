// pages/api/tickets/manual-create.ts

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

  const { eventId, seats, userEmail, buyer } = req.body;

  if (!eventId || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: "Faltan parámetros" });
  }

  try {
    // (Opcional) Crea un "order" manual si lo necesitas, o solo deja order_id = null
    // --- Crear los tickets manualmente ---
    const tokens: string[] = [];
    for (const seat_id of seats) {
      const newToken = uuidv4();
      const { data: ticketRow, error: insertError } = await supabase
        .from("tickets")
        .insert([
          {
            event_id: eventId,
            seat_id,
            token: newToken,
            buyer: buyer || null,
            email: userEmail || null,
            used: false,
            created_at: new Date().toISOString(),
            order_id: null, // Opcional: puedes guardar null o un id especial
          },
        ])
        .select("token")
        .single();

      if (insertError || !ticketRow) {
        return res
          .status(500)
          .json({ success: false, error: "Error interno al crear ticket." });
      }
      tokens.push(ticketRow.token);
    }

    // ENVIAR CORREO
    if (userEmail) {
      try {
        await sendTicketEmail({ to: userEmail, tokens });
      } catch (emailErr) {
        // Los tickets ya están en BD, pero hubo error al mandar el correo.
        // No abortamos, solo notificamos en logs y seguimos.
        console.error("Error enviando correo de boletos:", emailErr);
      }
    }

    return res.status(200).json({ success: true, tokens });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor." });
  }
}
