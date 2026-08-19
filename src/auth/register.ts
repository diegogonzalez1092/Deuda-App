/**
 * Registro con verificación de identidad. Requisito clave (ver README.md de
 * este módulo): el usuario solo puede quedar vinculado a SU PROPIA
 * identificación, nunca a la de un tercero — por eso registerUser no
 * confía en el DNI/CUIT que el usuario tipea, lo valida contra un
 * IdentityVerificationProvider antes de crear la cuenta.
 */

import { randomUUID } from "node:crypto";
import type { IdentityVerificationProvider, IdentityVerificationResult, Usuario } from "./types";

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationError";
  }
}

const IDENTIFICACION_REGEX = /^\d{11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Proveedor de verificación para desarrollo/testing. Aprueba cualquier
 * identificación con formato válido SIN verificar nada real — no usar en
 * producción bajo ninguna circunstancia.
 *
 * TODO (bloqueante para producción, ver docs/LEGAL-NOTES.md): elegir un
 * proveedor real. RENAPER no ofrece una API pública de autoservicio — el
 * acceso requiere convenio institucional con el Estado argentino, que
 * lleva tiempo y no es algo que se pueda resolver en código. La
 * alternativa más rápida para un MVP es un proveedor privado de KYC (ej.
 * validación biométrica + OCR de DNI: Onfido, Veriff, Ivify, etc.) —
 * comparar costo y cobertura en Argentina antes de elegir uno.
 */
export class MockIdentityProvider implements IdentityVerificationProvider {
  async verificar(
    identificacion: string,
    datosDeclarados: { nombre: string; apellido: string }
  ): Promise<IdentityVerificationResult> {
    if (!IDENTIFICACION_REGEX.test(identificacion)) {
      return {
        verificado: false,
        nombreCompleto: null,
        motivo: "Formato de CUIT/CUIL/CDI inválido (deben ser 11 dígitos, sin guiones)",
      };
    }
    return {
      verificado: true,
      nombreCompleto: `${datosDeclarados.nombre} ${datosDeclarados.apellido}`,
      motivo: null,
    };
  }
}

export interface RegisterUserParams {
  identificacion: string;
  nombre: string;
  apellido: string;
  email: string;
  provider: IdentityVerificationProvider;
}

export async function registerUser(params: RegisterUserParams): Promise<Usuario> {
  const { identificacion, nombre, apellido, email, provider } = params;

  if (!IDENTIFICACION_REGEX.test(identificacion)) {
    throw new RegistrationError(
      "identificacion inválida: debe ser CUIT/CUIL/CDI de 11 dígitos, sin guiones"
    );
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new RegistrationError("email inválido");
  }
  if (!nombre.trim() || !apellido.trim()) {
    throw new RegistrationError("nombre y apellido son obligatorios");
  }

  const resultado = await provider.verificar(identificacion, { nombre, apellido });
  if (!resultado.verificado) {
    throw new RegistrationError(
      `No se pudo verificar la identidad: ${resultado.motivo ?? "motivo desconocido"}`
    );
  }

  // TODO: persistir en la base de datos (DATABASE_URL, ver .env.example)
  // con `identificacion` encriptada at-rest. Todavía no hay capa de
  // persistencia en el repo — ver docs/ARCHITECTURE.md, Fase 2. La sesión/
  // autenticación (ej. NextAuth) también queda pendiente de esa capa.
  return {
    id: randomUUID(),
    identificacion,
    nombreCompleto: resultado.nombreCompleto ?? `${nombre} ${apellido}`,
    email,
    identidadVerificada: true,
    creadoEn: new Date().toISOString(),
  };
}
