"use server";

import { getSession } from "../../src/auth/session";
import { enviarConsultaAsesorEmail } from "../../src/email/sendConsultaAsesorEmail";

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
 * A diferencia del email de cortesía en app/consulta (que es best-effort
 * y nunca bloquea al usuario), acá el email ES el punto del formulario:
 * si no se puede enviar, se le avisa al usuario en vez de mostrar un
 * falso "listo, te contactamos".
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

  try {
    await enviarConsultaAsesorEmail({
      identificacion: session.identificacion,
      emailUsuario: session.email,
      mensaje,
    });
  } catch (err) {
    console.error("enviarConsultaAsesor: no se pudo enviar el email:", err);
    return {
      error:
        "No pudimos enviar tu consulta por un problema técnico. Probá de nuevo, o " +
        "escribinos directamente a capitalrecoveryconsulting@gmail.com.",
      enviado: false,
    };
  }

  return { error: null, enviado: true };
}
