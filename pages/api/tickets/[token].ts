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
    }
  | {
      valid: false;
      message: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketResponse>
) {
  // Sólo admitimos GET (para simplificar)
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

  if (ticketError) {
    // Error de lectura o no existe
    console.error("Error buscando ticket:", ticketError);
    return res
      .status(404)
      .json({ valid: false, message: "No se encontró un boleto con ese token." });
  }
  if (!ticket) {
    return res
      .status(404)
      .json({ valid: false, message: "No se encontró un boleto con ese token." });
  }

  if (ticket.used) {
    // Si ya estaba marcado como usado
    return res.status(200).json({
      valid: false,
      message: "Este boleto ya ha sido utilizado.",
    });
  }

  

  // 3) Obtener el evento asociado a esa orden
  const orderId = ticket.order_id;
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("event_id")
    .eq("id", orderId)
    .single();
console.log(orderRow)
  if (orderError || !orderRow) {
    console.error("Error obteniendo order_id:", orderError);
    return res.status(500).json({
      valid: false,
      message: "Error interno al obtener la información de la orden.",
    });
  }
  const eventId = orderRow.event_id;
  // 4) Obtener datos del evento (title, venue, date_time)
  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("name,venue_id, date")
    .eq("id", eventId)
    .single();
  console.log(eventRow)
  if (eventError || !eventRow) {
    console.error("Error obteniendo evento:", eventError);
    return res.status(500).json({
      valid: false,
      message: "Error interno al obtener la información del evento.",
    });
  }

  // 5) Todo OK, devolvemos datos para el cliente
  return res.status(200).json({
    valid: true,
    token,
    seatId: ticket.seat_id,           // ej. "B-8"
    eventTitle: eventRow.name,       // ej. "Concierto de Jazz"
    eventVenue: eventRow.venue_id,       // ej. "Auditorio Nacional"
    eventDateTime: eventRow.date, // ej. "2024-05-22T18:31:00Z"
  });
}
