/**
 * Cliente de la API pública "Central de Deudores" del BCRA.
 * Base URL: https://api.bcra.gob.ar
 * No requiere autenticación.
 *
 * Endpoints:
 *   GET /centraldedeudores/v1.0/Deudas/{identificacion}
 *   GET /centraldedeudores/v1.0/Deudas/Historicas/{identificacion}
 *   GET /centraldedeudores/v1.0/Deudas/ChequesRechazados/{identificacion}
 *
 * {identificacion} = CUIT, CUIL o CDI sin guiones, ej: "20304050607"
 *
 * NOTA: los tipos de la respuesta (ver ./types.ts) están armados a partir
 * de la documentación pública del endpoint. No se pudo verificar contra un
 * fetch real desde este entorno (el proxy de salida de la sesión bloquea
 * api.bcra.gob.ar por política de red). Antes de usar esto en producción,
 * correr una consulta real contra un CUIT con deuda conocida y confirmar
 * que el shape de types.ts coincide con la respuesta real.
 */

import type {
  BcraDeudasResponse,
  BcraDeudasResult,
  BcraChequesRechazadosResponse,
  BcraChequesRechazadosResult,
  BcraErrorResponse,
  DeudaSnapshot,
  Financiacion,
  SituacionCrediticia,
} from "./types";

// process.env.BCRA_API_BASE_URL puede existir como string vacío (ej. si se
// importó .env.example a un entorno sin completar el valor) — "" no es
// undefined, así que `??` sola no alcanza para caer al default.
const BCRA_BASE_URL = process.env.BCRA_API_BASE_URL?.trim() || "https://api.bcra.gob.ar";

export class BcraApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BcraApiError";
    this.status = status;
  }
}

/** CUIT/CUIL/CDI: 11 dígitos, sin guiones. */
function assertIdentificacionValida(identificacion: string): void {
  if (!/^\d{11}$/.test(identificacion)) {
    throw new Error(
      `identificacion inválida: "${identificacion}" (debe ser CUIT/CUIL/CDI de 11 dígitos, sin guiones)`
    );
  }
}

async function bcraFetch<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BCRA_BASE_URL}${path}`);

  if (res.status === 404) {
    // La API devuelve 404 cuando la identificación no tiene deuda
    // registrada — no es un error, es "sin resultados".
    return null;
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = (await res.json()) as BcraErrorResponse;
      if (err.errorMessages?.length) detail = err.errorMessages.join("; ");
    } catch {
      // body no era JSON parseable, nos quedamos con el status
    }
    throw new BcraApiError(`Error de la API del BCRA: ${detail}`, res.status);
  }

  return (await res.json()) as T;
}

export async function getDeudas(identificacion: string): Promise<BcraDeudasResult | null> {
  assertIdentificacionValida(identificacion);
  const data = await bcraFetch<BcraDeudasResponse>(
    `/centraldedeudores/v1.0/Deudas/${identificacion}`
  );
  return data?.results ?? null;
}

export async function getDeudasHistoricas(
  identificacion: string
): Promise<BcraDeudasResult | null> {
  assertIdentificacionValida(identificacion);
  const data = await bcraFetch<BcraDeudasResponse>(
    `/centraldedeudores/v1.0/Deudas/Historicas/${identificacion}`
  );
  return data?.results ?? null;
}

export async function getChequesRechazados(
  identificacion: string
): Promise<BcraChequesRechazadosResult | null> {
  assertIdentificacionValida(identificacion);
  const data = await bcraFetch<BcraChequesRechazadosResponse>(
    `/centraldedeudores/v1.0/Deudas/ChequesRechazados/${identificacion}`
  );
  return data?.results ?? null;
}

/**
 * Trae deuda + cheques rechazados en paralelo y arma el DeudaSnapshot
 * normalizado que consume el resto de la app (dashboard, marketplace).
 * Usa el período más reciente informado (periodos[0]).
 */
export async function getDeudaSnapshot(identificacion: string): Promise<DeudaSnapshot> {
  const [deudas, cheques] = await Promise.all([
    getDeudas(identificacion),
    getChequesRechazados(identificacion),
  ]);

  const ultimoPeriodo = deudas?.periodos[0];

  const financiaciones: Financiacion[] = (ultimoPeriodo?.entidades ?? []).map((e) => ({
    entidad: e.entidad,
    situacion: e.situacion as SituacionCrediticia,
    monto: e.monto * 1000, // la Central de Deudores informa "monto" en miles de pesos ARS
    moneda: "ARS",
    fechaInforme: periodoToIsoDate(ultimoPeriodo!.periodo),
    situacionNormalDesde: e.fechaSit1 || null,
  }));

  return {
    identificacion,
    denominacion: deudas?.denominacion || null,
    fechaConsulta: new Date().toISOString(),
    financiaciones,
    chequesRechazados: (cheques?.causales.length ?? 0) > 0,
  };
}

function periodoToIsoDate(periodo: string): string {
  const anio = periodo.slice(0, 4);
  const mes = periodo.slice(4, 6);
  return `${anio}-${mes}-01`;
}
