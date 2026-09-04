/**
 * Transporter SMTP compartido para todos los emails salientes de la app.
 * Se manda todo desde/a través de capitalrecoveryconsulting@gmail.com
 * vía SMTP real de Gmail — no un servicio de terceros simulando esa
 * dirección — para que salga autenticado por Google de verdad (mejor
 * entregabilidad, no queda marcado como spoof). Requiere que esa cuenta
 * de Gmail tenga verificación en 2 pasos activada y una "contraseña de
 * aplicación" generada en myaccount.google.com/apppasswords (ver
 * .env.example, GMAIL_APP_PASSWORD — NO es la contraseña normal).
 *
 * NOTA: Gmail para cuentas personales tiene un límite de ~500 emails/día
 * y no está pensado para envío transaccional a escala. Para producción
 * real conviene migrar a un proveedor dedicado (Resend, SendGrid, etc.)
 * con un dominio propio verificado — queda anotado en docs/NEXT-STEPS.md.
 */

import nodemailer from "nodemailer";

export const REMITENTE = process.env.GMAIL_USER?.trim() || "capitalrecoveryconsulting@gmail.com";

function requireAppPassword(): string {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    throw new Error(
      "GMAIL_APP_PASSWORD no está configurado (ver .env.example) — hace falta para enviar emails"
    );
  }
  return pass;
}

export function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: REMITENTE,
      pass: requireAppPassword(),
    },
  });
}
