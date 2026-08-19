export interface IdentityVerificationResult {
  verificado: boolean;
  nombreCompleto: string | null;
  motivo: string | null; // por qué falló la verificación, si falló
}

/**
 * Cualquier proveedor de verificación de identidad (RENAPER, un servicio de
 * KYC de terceros, etc.) implementa esta interfaz. Ver MockIdentityProvider
 * en register.ts para la implementación de desarrollo y el TODO sobre por
 * qué no hay una implementación real todavía.
 */
export interface IdentityVerificationProvider {
  verificar(
    identificacion: string,
    datosDeclarados: { nombre: string; apellido: string }
  ): Promise<IdentityVerificationResult>;
}

export interface Usuario {
  id: string;
  identificacion: string; // CUIT/CUIL/CDI — persistir encriptado at-rest, ver register.ts
  nombreCompleto: string;
  email: string;
  identidadVerificada: boolean;
  creadoEn: string; // ISO date
}
