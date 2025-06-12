import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false, message: "Método no permitido" });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ valid: false, message: "Token requerido" });
  }

  // Busca el ticket por token
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !ticket) {
    return res.status(404).json({ valid: false, message: "Boleto no encontrado" });
  }

  if (ticket.used) {
    return res.status(409).json({ valid: false, message: "Boleto ya registrado (check-in previo)", ticket });
  }

  // Marca como usado
  const { error: updateError } = await supabase
    .from("tickets")
    .update({ used: true })
    .eq("token", token);

  if (updateError) {
    return res.status(500).json({ valid: false, message: "No se pudo actualizar" });
  }

  res.status(200).json({
    valid: true,
    message: "¡Boleto válido, acceso concedido!",
    seatId: ticket.seat_id,
    ticket,
  });
}
