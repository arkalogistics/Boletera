// pages/api/tickets/[token].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

type TicketResponse =
  | {
      valid: true;
      seatId: string;
      eventTitle: string;
      eventVenue: string;
      eventDateTime: string;
      token: string;
      image_url: string;      // ← añadimos este campo
      place: string;
    }
  | {
      valid: false;
      message: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketResponse>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ valid: false, message: "Method Not Allowed" });
  }

  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res
      .status(400)
      .json({ valid: false, message: "Token inválido o faltante en la URL" });
  }

  // 1) Buscar el ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, used, seat_id, order_id")
    .eq("token", token)
    .single();

  if (ticketError || !ticket) {
    console.error("Error buscando ticket:", ticketError);
    return res
      .status(404)
      .json({ valid: false, message: "No se encontró un boleto con ese token." });
  }
  if (ticket.used) {
    return res.status(200).json({
      valid: false,
      message: "Este boleto ya ha sido utilizado.",
    });
  }

  // 2) Obtener order_id
  const orderId = ticket.order_id;
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("event_id")
    .eq("id", orderId)
    .single();

  if (orderError || !orderRow) {
    console.error("Error obteniendo order_id:", orderError);
    return res.status(500).json({
      valid: false,
      message: "Error interno al obtener la información de la orden.",
    });
  }

  // 3) Obtener datos del evento incluyendo image_url
  const eventId = orderRow.event_id;
  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("name, venue_id, date, image_url,place")   // ← incluimos image_url
    .eq("id", eventId)
    .single();

  if (eventError || !eventRow) {
    console.error("Error obteniendo evento:", eventError);
    return res.status(500).json({
      valid: false,
      message: "Error interno al obtener la información del evento.",
    });
  }

  // 4) Devolver todo al cliente
  return res.status(200).json({
    valid: true,
    token,
    seatId: ticket.seat_id,
    eventTitle: eventRow.name,
    eventVenue: eventRow.venue_id,
    eventDateTime: eventRow.date,
    image_url: eventRow.image_url,   // ← devolvemos la URL de la imagen
    place: eventRow.place
  });
}
