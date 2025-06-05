// pages/api/session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";

type Data =
  | {
      success: true;
      payment_status: string; // ej. "paid", "unpaid"
    }
  | {
      success: false;
      error: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Sólo GET (podrías permitir POST si quisieras)
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { session_id } = req.query;
  if (!session_id || typeof session_id !== "string") {
    return res
      .status(400)
      .json({ success: false, error: "Falta session_id en la query." });
  }

  try {
    // Recuperamos la sesión de Stripe en el servidor (no en el cliente)
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Sesión de Stripe no encontrada." });
    }

    // Devolvemos al cliente solamente el payment_status
    return res.status(200).json({
      success: true,
      payment_status: session.payment_status || "unpaid",
    });
  } catch (err: any) {
    console.error("Error en /api/session:", err);
    return res
      .status(500)
      .json({ success: false, error: "Error interno al recuperar la sesión." });
  }
}
