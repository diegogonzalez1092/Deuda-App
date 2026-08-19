/**
 * Tipos según la documentación pública de la API "Central de Deudores" del
 * BCRA (https://api.bcra.gob.ar).
 *
 * NOTA: no se pudo correr un fetch de prueba real desde este entorno — el
 * proxy de salida de esta sesión bloquea api.bcra.gob.ar (403, política de
 * red de la organización). Estos tipos están armados a partir de la
 * documentación pública del endpoint, no de una respuesta verificada en
 * vivo. Antes de confiar en esto en producción, correr una consulta real
 * (ej. `getDeudas("30500010912")` contra un CUIT con deuda conocida) y
 * ajustar los tipos si el shape real difiere.
 */

// ---- Shape crudo de la API ----

export interface BcraEntidadDeuda {
  entidad: string;
  situacion: number; // 1-5, ver SituacionCrediticia
  fechaSit1: string; // ISO date: última vez que estuvo en situación 1
  monto: number; // en miles de pesos (ARS)
  diasAtrasoPago: number;
  refinanciaciones: boolean;
  recategorizacionOblig: boolean;
  situacionJuridica: boolean;
  irrecDisposicionTecnica: boolean;
  enRevision: boolean;
  procesoJud: boolean;
}

export interface BcraPeriodoDeuda {
  periodo: string; // "AAAAMM", ej "202401"
  entidades: BcraEntidadDeuda[];
}

export interface BcraDeudasResult {
  identificacion: number;
  denominacion: string;
  periodos: BcraPeriodoDeuda[]; // [0] = período más reciente
}

export interface BcraDeudasResponse {
  status: number;
  results: BcraDeudasResult;
}

export interface BcraChequeDetalle {
  nroCheque: number;
  fechaRechazo: string; // ISO date
  monto: number;
  fechaPago: string | null;
  fechaPagoMulta: string | null;
  estadoMulta: string;
  ctaPersonal: boolean;
  denomJuridica: string | null;
  enRevision: boolean;
  procesoJud: boolean;
}

export interface BcraChequeEntidad {
  entidad: number;
  detalle: BcraChequeDetalle[];
}

export interface BcraChequeCausal {
  causal: string;
  entidades: BcraChequeEntidad[];
}

export interface BcraChequesRechazadosResult {
  identificacion: number;
  denominacion: string;
  causales: BcraChequeCausal[];
}

export interface BcraChequesRechazadosResponse {
  status: number;
  results: BcraChequesRechazadosResult;
}

/** Shape que devuelve la API cuando hay un error o no hay resultados (404). */
export interface BcraErrorResponse {
  status: number;
  errorMessages: string[];
}

// ---- Tipos normalizados que consume el resto de la app ----

export type SituacionCrediticia = 1 | 2 | 3 | 4 | 5;
// 1 = normal, 2 = riesgo bajo, 3 = riesgo medio, 4 = riesgo alto, 5 = irrecuperable

export interface Financiacion {
  entidad: string;
  situacion: SituacionCrediticia;
  monto: number;
  moneda: string;
  fechaInforme: string; // ISO date
}

export interface DeudaSnapshot {
  identificacion: string; // CUIT/CUIL/CDI
  fechaConsulta: string; // ISO date
  financiaciones: Financiacion[];
  chequesRechazados: boolean;
}
