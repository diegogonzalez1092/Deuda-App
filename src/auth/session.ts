/**
 * Sesión sin contraseña ("DNI-first"): el usuario entra su DNI/CUIT/CDI +
 * email, validamos el formato, traemos su deuda del BCRA y firmamos una
 * cookie con esos datos — no hay tabla de usuarios ni contraseña. Mismo
 * modelo que ponetealdia.com (la referencia de este proyecto, ver
 * README.md): el valor es "mirá tu situación gratis", no una cuenta
 * tradicional.
 *
 * Trade-off explícito: como no hay verificación de identidad en este flujo
 * (a diferencia de registerUser() en register.ts, que sí la exige), un
 * usuario puede consultar el CUIT de un tercero — igual que podría hacerlo
 * directamente en el sitio del BCRA, que es público. La UI debe dejarlo
 * claro (ver app/consulta/page.tsx).
 *
 * TODO: si más adelante se agregan cuentas con contraseña persistentes
 * (la alternativa que se evaluó y no se eligió), esto se reemplaza por
 * sesiones respaldadas en la base de datos de la Fase 2.
 */

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "debtapp_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

export interface SessionData {
  identificacion: string;
  email: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET no está configurado (ver .env.example) — hace falta para firmar la sesión"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(data: SessionData): Promise<void> {
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.identificacion !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { identificacion: payload.identificacion, email: payload.email };
  } catch {
    return null; // cookie inválida o expirada
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
