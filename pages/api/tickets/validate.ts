// pages/api/tickets/validate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

type Data =
  | { success: true; message: string }
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
    token: string;
  }

  const { token } = req.body as Body;
  if (typeof token !== "string" || !token) {
    return res
      .status(400)
      .json({ success: false, error: "Falta token en la petición." });
  }

  try {
    // 1) Buscar el ticket por token
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("id, used")
      .eq("token", token)
      .single();

    if (ticketError || !ticket) {
      return res
        .status(404)
        .json({ success: false, error: "Ticket no encontrado." });
    }

    if (ticket.used) {
      return res
        .status(400)
        .json({ success: false, error: "Este ticket ya fue usado." });
    }

    // 2) Marcar como usado
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ used: true })
      .eq("id", ticket.id);

    if (updateError) {
      console.error("Error marcando ticket como usado:", updateError);
      return res
        .status(500)
        .json({ success: false, error: "Error al actualizar el ticket." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Ticket validado correctamente." });
  } catch (err) {
    console.error("Error en /api/tickets/validate:", err);
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor." });
  }
}
