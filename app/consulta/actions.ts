"use server";

import { redirect } from "next/navigation";
import { createSession } from "../../src/auth/session";

const IDENTIFICACION_REGEX = /^\d{11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ConsultaFormState {
  error: string | null;
}

/**
 * No hace la consulta al BCRA acá — solo valida formato, abre sesión y
 * redirige a /dashboard, que es quien efectivamente llama a
 * getDeudaSnapshot(). Evita pedirle la deuda al BCRA dos veces por cada
 * consulta nueva.
 */
export async function consultarSituacion(
  _prevState: ConsultaFormState,
  formData: FormData
): Promise<ConsultaFormState> {
  const identificacion = String(formData.get("identificacion") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!IDENTIFICACION_REGEX.test(identificacion)) {
    return { error: "El DNI/CUIT/CUIL debe tener 11 dígitos, sin puntos ni guiones." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: "Ingresá un email válido." };
  }

  try {
    await createSession({ identificacion, email });
  } catch (err) {
    // Falla más común acá: SESSION_SECRET no está seteado en el entorno
    // (ver .env.example) — sin eso no se puede firmar la cookie de sesión.
    console.error("consultarSituacion: no se pudo crear la sesión:", err);
    return {
      error:
        "No pudimos iniciar tu sesión por un problema de configuración del servidor. " +
        "Si sos el administrador: revisá que SESSION_SECRET esté seteado en las " +
        "variables de entorno.",
    };
  }

  redirect("/dashboard");
}
