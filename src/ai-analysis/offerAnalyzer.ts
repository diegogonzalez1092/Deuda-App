/**
 * Motor de análisis de ofertas de regularización de deuda.
 * Usado por marketplace/ (para explicar una oferta al usuario) y
 * por negotiation/ (para sugerir una contraoferta, cuando ese módulo
 * esté habilitado).
 *
 * Llama a la API de Claude (Anthropic) para parsear el texto de la oferta
 * y devolver un análisis estructurado.
 *
 * TODO (Claude Code):
 *   1. Definir el shape exacto de OfferAnalysis según lo que necesite el
 *      frontend mostrar (tasa efectiva, quita %, cuotas, comparación vs
 *      benchmark del sector).
 *   2. Escribir el system prompt pidiendo SOLO JSON de salida (ver ejemplo
 *      de "structured outputs" para no romper el parseo).
 *   3. Manejar el caso de oferta ambigua o incompleta (pedir más info al
 *      usuario en vez de inventar números).
 */

export interface OfferAnalysis {
  entidad: string;
  montoOriginal: number;
  montoOfrecido: number;
  quitaPorcentaje: number;
  tasaEfectiva: number | null;
  cuotas: number | null;
  recomendacion: "conviene" | "revisar" | "no_conviene";
  resumen: string;
}

export async function analyzeOffer(offerText: string): Promise<OfferAnalysis> {
  // TODO: llamar a la API de Claude (modelo claude-sonnet-4-6) con
  // max_tokens ~1000, pidiendo respuesta SOLO en JSON, parsear con
  // try/catch (ver anthropic_api_in_artifacts para el patrón exacto).
  throw new Error("not implemented");
}
