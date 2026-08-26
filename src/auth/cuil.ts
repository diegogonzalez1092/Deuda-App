/**
 * Deriva el CUIL de una persona física a partir de su DNI y sexo
 * registral, usando el algoritmo estándar de dígito verificador (módulo
 * 11) que usa AFIP para CUIT/CUIL. Es una heurística, no una consulta
 * oficial: cubre el caso normal de una persona física con DNI moderno,
 * pero puede no coincidir con el CUIL real en casos raros (CUIL
 * provisorio, personas jurídicas). Si el CUIL derivado no trae datos
 * coherentes del BCRA, el usuario puede ingresar su CUIT/CUIL
 * directamente en el formulario en vez de su DNI.
 */

const MULTIPLICADORES = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

function digitoVerificador(base10: string): number {
  const suma = base10
    .split("")
    .reduce((acc, digito, i) => acc + Number(digito) * MULTIPLICADORES[i], 0);
  const resto = suma % 11;
  const verificador = 11 - resto;
  return verificador === 11 ? 0 : verificador; // 10 = prefijo inválido para este DNI
}

function intentarPrefijo(prefijo: string, dni: string): string | null {
  const base = `${prefijo}${dni}`;
  const verificador = digitoVerificador(base);
  if (verificador === 10) return null;
  return `${base}${verificador}`;
}

export type Sexo = "M" | "F";

export function derivarCuil(dniInput: string, sexo: Sexo): string {
  const dni = dniInput.trim();
  if (!/^\d{7,8}$/.test(dni)) {
    throw new Error("DNI inválido: debe tener 7 u 8 dígitos, sin puntos");
  }
  const dniNormalizado = dni.padStart(8, "0");

  const prefijoPrincipal = sexo === "M" ? "20" : "27";
  const cuil =
    intentarPrefijo(prefijoPrincipal, dniNormalizado) ?? intentarPrefijo("23", dniNormalizado);

  if (!cuil) {
    throw new Error(
      "No pudimos calcular un CUIL válido para ese DNI — ingresá tu CUIT/CUIL directamente"
    );
  }
  return cuil;
}
