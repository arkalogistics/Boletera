// lib/email.ts
import Mailjet from "node-mailjet";

interface SendTicketEmailOpts {
  to: string;
  tokens: string[];
}

/**
 * Conecta a Mailjet usando API Key y Secret Key (variables de entorno MJ_APIKEY_PUBLIC y MJ_APIKEY_PRIVATE).
 */
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC!,
  process.env.MJ_APIKEY_PRIVATE!
);

export async function sendTicketEmail({ to, tokens }: SendTicketEmailOpts) {
  if (
    !process.env.MJ_APIKEY_PUBLIC ||
    !process.env.MJ_APIKEY_PRIVATE ||
    !process.env.NEXT_PUBLIC_APP_URL
  ) {
    throw new Error(
      "❌ Asegúrate de tener MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE y NEXT_PUBLIC_APP_URL en tu .env.local"
    );
  }

  // Construimos un bloque HTML con un enlace por cada token
  const ticketLinksHtml = tokens
    .map((token) => {
      // La URL a la que el usuario será dirigido; por ejemplo:
      const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/ticket/${token}`;
      return `
        <li style="margin-bottom: 12px;">
          <a href="${ticketUrl}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">
            Ver mi boleto (token: ${token})
          </a>
        </li>
      `;
    })
    .join("");

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="margin-bottom: 16px;">¡Tus entradas están listas! 🎫</h2>
      <p style="margin-bottom: 24px;">
        Gracias por tu compra. A continuación encontrarás un enlace para cada boleto que adquiriste:
      </p>
      <ul style="padding-left: 20px; margin-bottom: 24px;">
        ${ticketLinksHtml}
      </ul>
      <hr style="margin: 24px 0; border-color: #ccc;" />
      <p style="font-size: 0.85em; color: #666;">
        Cuando accedas a cualquiera de estos enlaces, el sistema validará tu ticket y lo marcará como usado.
        Si vuelves a escanear la misma URL, aparecerá como “boleto inválido” (ya fue canjeado).
      </p>
    </div>
  `;

  try {
    const request = mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: "andraeventsofficial@gmail.com", // Debe estar validado en Mailjet
              Name:  "Andro",
            },
            To: [
              {
                Email: to,
                Name:  "", // opcional
              },
            ],
            Subject: "Tus tickets están listos 🎟️",
            TextPart:
              "Gracias por tu compra. Accede a tus boletos desde los enlaces proporcionados.",
            HTMLPart: htmlBody,
          },
        ],
      });

    await request; // si falla arrojará excepción
  } catch (err: any) {
    console.error("Mailjet error enviando boletos:", err);
    throw new Error("Error enviando correo de boletos con Mailjet");
  }
}
