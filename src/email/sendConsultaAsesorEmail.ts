/**
 * Notifica a capitalrecoveryconsulting@gmail.com cuando alguien deja una
 * consulta para un asesor desde app/asesor. A diferencia de
 * sendDeudaEmail.ts (que le escribe al usuario), acá el remitente y el
 * destinatario son la misma casilla — es la bandeja de entrada de la
 * empresa, no la del usuario. replyTo apunta al email del usuario para
 * que responder desde Gmail vaya directo a él.
 */

import { REMITENTE, getTransporter } from "./transporter";

export interface EnviarConsultaAsesorParams {
  identificacion: string;
  emailUsuario: string;
  mensaje: string;
}

export async function enviarConsultaAsesorEmail(params: EnviarConsultaAsesorParams): Promise<void> {
  const { identificacion, emailUsuario, mensaje } = params;

  const text = [
    "Nueva consulta para un asesor desde la web.",
    "",
    `Identificación: ${identificacion}`,
    `Email de contacto: ${emailUsuario}`,
    "",
    "Mensaje:",
    mensaje,
  ].join("\n");

  const html = `
    <p><strong>Nueva consulta para un asesor desde la web.</strong></p>
    <p>
      <strong>Identificación:</strong> ${identificacion}<br/>
      <strong>Email de contacto:</strong> ${emailUsuario}
    </p>
    <p><strong>Mensaje:</strong><br/>${mensaje.replace(/\n/g, "<br/>")}</p>
  `;

  await getTransporter().sendMail({
    from: `"Capital Recovery Consulting — Web" <${REMITENTE}>`,
    to: REMITENTE,
    replyTo: emailUsuario,
    subject: `Nueva consulta de asesor — ${identificacion}`,
    text,
    html,
  });
}
