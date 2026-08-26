"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession } from "../../src/auth/session";
import { derivarCuil, type Sexo } from "../../src/auth/cuil";
import { getDeudaSnapshot } from "../../src/bcra-sync/client";
import { getDolarOficial } from "../../src/fx/dolarOficial";
import { enviarEmailDeuda } from "../../src/email/sendDeudaEmail";

const IDENTIFICACION_REGEX = /^\d{11}$/;
const DNI_REGEX = /^\d{7,8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ConsultaFormState {
  error: string | null;
}

/**
 * Trae la deuda del BCRA una vez más de lo estrictamente necesario
 * (dashboard/page.tsx vuelve a pedirla para mostrarla) porque el email
 * tiene que salir en el momento de esta consulta, no en cada visita
 * posterior al dashboard. Nunca bloquea el flujo: si el BCRA, el dólar
 * o el envío del mail fallan, se loguea y el usuario igual llega a su
 * dashboard con la sesión creada.
 */
async function enviarEmailDeCortesia(identificacion: string, email: string): Promise<void> {
  try {
    const [deuda, dolarResult] = await Promise.all([
      getDeudaSnapshot(identificacion),
      getDolarOficial().catch(() => null),
    ]);

    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = host?.startsWith("localhost") ? "http" : "https";
    const asesorUrl = `${protocol}://${host}/asesor`;

    await enviarEmailDeuda({ destinatario: email, deuda, dolar: dolarResult, asesorUrl });
  } catch (err) {
    console.error("consultarSituacion: no se pudo enviar el email de deuda:", err);
  }
}
export async function consultarSituacion(
  _prevState: ConsultaFormState,
  formData: FormData
): Promise<ConsultaFormState> {
  const modo = String(formData.get("modo") ?? "cuit");
  const email = String(formData.get("email") ?? "").trim();

  if (!EMAIL_REGEX.test(email)) {
    return { error: "Ingresá un email válido." };
  }

  let identificacion: string;
  let origen: "cuit" | "dni";

  if (modo === "dni") {
    const dni = String(formData.get("dni") ?? "").trim();
    const sexo = String(formData.get("sexo") ?? "");

    if (!DNI_REGEX.test(dni)) {
      return { error: "El DNI debe tener 7 u 8 dígitos, sin puntos." };
    }
    if (sexo !== "M" && sexo !== "F") {
      return { error: "Seleccioná el sexo registrado en tu DNI para calcular el CUIL." };
    }

    try {
      identificacion = derivarCuil(dni, sexo as Sexo);
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "No pudimos calcular tu CUIL a partir del DNI.",
      };
    }
    origen = "dni";
  } else {
    identificacion = String(formData.get("identificacion") ?? "").trim();
    if (!IDENTIFICACION_REGEX.test(identificacion)) {
      return { error: "El CUIT/CUIL/CDI debe tener 11 dígitos, sin puntos ni guiones." };
    }
    origen = "cuit";
  }

  try {
    await createSession({ identificacion, email, origen });
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

  await enviarEmailDeCortesia(identificacion, email);

  redirect("/dashboard");
}
