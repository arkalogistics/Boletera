// pages/api/tickets/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { sendTicketEmail } from "../../../lib/email"; // <— Importa el helper que creamos

type Data =
  | { success: true; token: string }
  | { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  interface Body {
    sessionId: string;
  }

  const { sessionId } = req.body as Body;
  if (typeof sessionId !== "string" || !sessionId) {
    return res
      .status(400)
      .json({ success: false, error: "Falta sessionId en la petición." });
  }

  try {
    // 1) Buscar la orden por stripe_session, incluyendo el user_email
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_email")
      .eq("stripe_session", sessionId)
      .single();

    if (orderError || !order) {
      return res
        .status(404)
        .json({ success: false, error: "Orden no encontrada." });
    }

    const orderId = order.id;
    const userEmail = order.user_email;

    // 2) Verificar si ya existe un ticket para esta orden
    const { data: existing, error: existingError } = await supabase
      .from("tickets")
      .select("token")
      .eq("order_id", orderId)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      // PGRST116 = no encontrado → ok
      console.error("Error buscando ticket existente:", existingError);
      return res
        .status(500)
        .json({ success: false, error: "Error interno al buscar ticket." });
    }

    let token: string;
    if (existing) {
      // Si ya existe, devolvemos el mismo token (y no reenviamos el correo)
      token = existing.token;
      return res.status(200).json({ success: true, token });
    }

    // 3) Generar nuevo token (UUID) y guardarlo
    token = uuidv4();
    const { data: ticket, error: insertError } = await supabase
      .from("tickets")
      .insert([
        {
          order_id: orderId,
          token,
          used: false,
        },
      ])
      .select("token")
      .single();

    if (insertError || !ticket) {
      console.error("Error al crear el ticket:", insertError);
      return res
        .status(500)
        .json({ success: false, error: "Error interno al crear ticket." });
    }

    // 4) Enviar el correo con el QR al usuario
    try {
      await sendTicketEmail(userEmail, ticket.token);
    } catch (emailErr) {
      console.error(
        "Error enviando el correo de ticket, pero ticket ya creado:",
        emailErr
      );
      // No abortamos toda la petición; el ticket ya existe. Sólo notificamos fallo por consola.
    }

    // 5) Devolver el token al front
    return res.status(200).json({ success: true, token: ticket.token });
  } catch (err) {
    console.error("Error en /api/tickets/create:", err);
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor." });
  }
}
