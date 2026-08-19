/**
 * Cliente de la API pública "Central de Deudores" del BCRA.
 * Base URL: https://api.bcra.gob.ar
 * No requiere autenticación.
 *
 * Endpoints documentados a implementar:
 *   GET /centraldedeudores/v1.0/Deudas/{identificacion}
 *   GET /centraldedeudores/v1.0/Deudas/Historicas/{identificacion}
 *   GET /centraldedeudores/v1.0/Deudas/ChequesRechazados/{identificacion}
 *
 * {identificacion} = CUIT, CUIL o CDI sin guiones, ej: "20304050607"
 *
 * TODO (Claude Code): implementar cada función, tipar la respuesta real
 * de la API (correr un fetch de prueba primero para ver el shape exacto),
 * y manejar el caso "sin información" (la API devuelve una respuesta vacía
 * o un mensaje específico cuando la persona no tiene deuda registrada).
 */

const BCRA_BASE_URL = "https://api.bcra.gob.ar";

export async function getDeudas(identificacion: string): Promise<unknown> {
  // TODO: fetch(`${BCRA_BASE_URL}/centraldedeudores/v1.0/Deudas/${identificacion}`)
  throw new Error("not implemented");
}

export async function getDeudasHistoricas(identificacion: string): Promise<unknown> {
  // TODO: fetch(`${BCRA_BASE_URL}/centraldedeudores/v1.0/Deudas/Historicas/${identificacion}`)
  throw new Error("not implemented");
}

export async function getChequesRechazados(identificacion: string): Promise<unknown> {
  // TODO: fetch(`${BCRA_BASE_URL}/centraldedeudores/v1.0/Deudas/ChequesRechazados/${identificacion}`)
  throw new Error("not implemented");
}
