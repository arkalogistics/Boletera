// lib/email.ts
import nodemailer from "nodemailer";
import QRCode from "qrcode";

if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_PORT ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS
) {
  throw new Error(
    "❌ Faltan variables SMTP en .env.local (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)."
  );
}

// 1) Configura el transport de nodemailer usando SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true si usas puerto 465 (SSL), false si 587 o 25 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2) Función para enviar correo con el QR embebido
export async function sendTicketEmail(to: string, token: string) {
  try {
    // 2.1) Generar data URL del QR (base64) a partir del token
    //     Para que el correo contenga <img src="data:image/png;base64,...." />
    const qrDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
    });
    // qrDataUrl es algo como "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."

    // 2.2) Definir el contenido HTML del correo
    const htmlBody = `
      <h2 style="color: #333;">Tu entrada está lista 🎫</h2>
      <p>Gracias por tu compra. A continuación encontrarás tu código QR. <br>
         Por favor, muéstralo en la entrada al evento.</p>
      <div style="margin: 20px 0;">
        <!-- Insertamos el QR como data URL -->
        <img src="${qrDataUrl}" alt="Código QR de tu ticket" style="max-width: 100%; height: auto; border: 1px solid #ddd; padding: 10px; background: #fff;" />
      </div>
      <p style="font-size: 0.9em; color: #666;">
        Si tu lector de correo no muestra imágenes, puedes usar este token manualmente: <br>
        <code>${token}</code>
      </p>
      <hr>
      <p style="font-size: 0.8em; color: #999;">
        Este correo ha sido enviado de forma automática. Por favor, no respondas a esta dirección.
      </p>
    `;

    // 2.3) Enviar el correo
    await transporter.sendMail({
      from: `"Cinema de Cámara" <${process.env.SMTP_USER}>`, // remitente
      to, // destinatario (email del usuario)
      subject: "Tu ticket para Cinema de Cámara 📩",
      html: htmlBody,
      text: `Gracias por tu compra. Tu token de entrada es: ${token}`,
    });

    console.log(`✅ Correo de ticket enviado a ${to}`);
  } catch (err) {
    console.error("❌ Error enviando correo de ticket:", err);
    throw err; // Propaga el error al caller
  }
}
