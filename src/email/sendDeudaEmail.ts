/**
 * Envío del email con el detalle de deuda al usuario, desde
 * capitalrecoveryconsulting@gmail.com vía SMTP de Gmail — no un servicio
 * de terceros simulando esa dirección, para que salga autenticado por
 * Google de verdad (mejor entregabilidad, no queda marcado como spoof).
 * Requiere que esa cuenta de Gmail tenga verificación en 2 pasos activada
 * y una "contraseña de aplicación" generada en
 * myaccount.google.com/apppasswords (ver .env.example, GMAIL_APP_PASSWORD
 * — NO es la contraseña normal de la cuenta).
 *
 * NOTA: Gmail para cuentas personales tiene un límite de ~500 emails/día
 * y no está pensado para envío transaccional a escala. Para producción
 * real conviene migrar a un proveedor dedicado (Resend, SendGrid, etc.)
 * con un dominio propio verificado — queda anotado en docs/NEXT-STEPS.md.
 */

import nodemailer from "nodemailer";
import type { DeudaSnapshot } from "../bcra-sync/types";
import type { DolarOficial } from "../fx/dolarOficial";
import { pesosAUsd } from "../fx/dolarOficial";

const REMITENTE = process.env.GMAIL_USER?.trim() || "capitalrecoveryconsulting@gmail.com";

function requireAppPassword(): string {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    throw new Error(
      "GMAIL_APP_PASSWORD no está configurado (ver .env.example) — hace falta para enviar el email"
    );
  }
  return pass;
}

function getTransporter() {
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

function formatMonto(monto: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(monto);
}

function formatUsd(monto: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(monto);
}

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-AR");
}

function armarDetalleTexto(deuda: DeudaSnapshot, dolar: DolarOficial | null): string {
  if (deuda.financiaciones.length === 0) {
    return "No encontramos deudas registradas a tu nombre en el BCRA.";
  }
  return deuda.financiaciones
    .map((f) => {
      const usd = dolar ? ` (≈ ${formatUsd(pesosAUsd(f.monto, dolar))})` : "";
      const desde = f.situacionNormalDesde
        ? ` — en situación irregular desde aprox. ${formatFecha(f.situacionNormalDesde)}`
        : "";
      return `- ${f.entidad}: ${formatMonto(f.monto)}${usd}${desde}`;
    })
    .join("\n");
}

function armarDetalleHtml(deuda: DeudaSnapshot, dolar: DolarOficial | null): string {
  if (deuda.financiaciones.length === 0) {
    return "<p>No encontramos deudas registradas a tu nombre en el BCRA.</p>";
  }
  const filas = deuda.financiaciones
    .map((f) => {
      const usd = dolar ? ` (≈ ${formatUsd(pesosAUsd(f.monto, dolar))})` : "";
      const desde = f.situacionNormalDesde
        ? `<br/><span style="color:#4b5563;font-size:0.85em;">En situación irregular desde aprox. ${formatFecha(
            f.situacionNormalDesde
          )}</span>`
        : "";
      return `<li><strong>${f.entidad}</strong>: ${formatMonto(f.monto)}${usd}${desde}</li>`;
    })
    .join("");
  return `<ul>${filas}</ul>`;
}

export interface EnviarEmailDeudaParams {
  destinatario: string;
  deuda: DeudaSnapshot;
  dolar: DolarOficial | null;
  asesorUrl: string;
}

export async function enviarEmailDeuda(params: EnviarEmailDeudaParams): Promise<void> {
  const { destinatario, deuda, dolar, asesorUrl } = params;

  const intro =
    "Hola! Debido a tu interés para consultar tu situación crediticia, te comparto los " +
    "detalles de tu deuda. Además tené en cuenta que podés contactarte con un asesor " +
    "para que te guíe en los próximos pasos.";

  const text = `${intro}\n\n${armarDetalleTexto(deuda, dolar)}\n\nConsultar con un asesor: ${asesorUrl}`;

  const html = `
    <p>${intro}</p>
    ${armarDetalleHtml(deuda, dolar)}
    <p>
      <a href="${asesorUrl}" style="background:#0b2447;color:#ffffff;padding:0.65rem 1.25rem;border-radius:10px;text-decoration:none;display:inline-block;">
        Consultar con un asesor
      </a>
    </p>
  `;

  await getTransporter().sendMail({
    from: `"Capital Recovery Consulting" <${REMITENTE}>`,
    to: destinatario,
    subject: "Tu situación crediticia — Capital Recovery Consulting",
    text,
    html,
  });
}
