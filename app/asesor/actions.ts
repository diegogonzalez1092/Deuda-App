"use server";

import { getSession } from "../../src/auth/session";

export interface AsesorFormState {
  error: string | null;
  enviado: boolean;
}

/**
 * Captura de interés en hablar con un asesor humano — distinto de
 * src/negotiation (gestoría activa/negociación en nombre del usuario),
 * que sigue bloqueada por ENABLE_NEGOTIATION hasta la revisión legal
 * (ver docs/LEGAL-NOTES.md). Esto es solo "quiero que me contacten", sin
 * involucrar negociación con la entidad acreedora.
 *
 * TODO: no hay proveedor de email ni base de datos configurado todavía
 * (ver docs/ARCHITECTURE.md Fase 2) — por ahora la consulta solo queda
 * en los logs del servidor. Conectar con un servicio de email (ej.
 * Resend, SendGrid) o persistirla en DB para que un asesor humano la
 * vea de verdad.
 */
export async function enviarConsultaAsesor(
  _prevState: AsesorFormState,
  formData: FormData
): Promise<AsesorFormState> {
  const session = await getSession();
  if (!session) {
    return { error: "Tu sesión expiró — volvé a consultar tu situación.", enviado: false };
  }

  const mensaje = String(formData.get("mensaje") ?? "").trim();
  if (!mensaje) {
    return { error: "Contanos brevemente qué necesitás.", enviado: false };
  }

  console.log("Nueva consulta a asesor:", {
    identificacion: session.identificacion,
    email: session.email,
    mensaje,
    fecha: new Date().toISOString(),
  });

  return { error: null, enviado: true };
}
