/**
 * TODO (Claude Code): reemplazar por los tipos reales una vez que
 * client.ts haga el primer fetch de prueba contra la API del BCRA
 * y veamos el shape exacto de la respuesta. Estos son un punto de
 * partida basado en la documentación pública.
 */

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
