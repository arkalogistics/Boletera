// pages/api/admin-login.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;

  // Solo compara del lado del server (NUNCA pongas el password en el frontend)
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Puedes usar un JWT, pero aquí solo regreso "ok"
    return res.status(200).json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, message: "Credenciales incorrectas" });
  }
}
