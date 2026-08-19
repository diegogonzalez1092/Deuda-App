/**
 * Motor de análisis de ofertas de regularización de deuda.
 * Usado por marketplace/ (para explicar una oferta al usuario) y
 * por negotiation/ (para sugerir una contraoferta, cuando ese módulo
 * esté habilitado).
 *
 * Llama a la API de Claude (Anthropic) para parsear el texto de la oferta
 * y devolver un análisis estructurado. Usa structured outputs
 * (output_config.format + zodOutputFormat) en vez de pedirle JSON por
 * prompt y parsearlo a mano — la API valida la respuesta contra el schema,
 * así que no hace falta un try/catch de JSON.parse.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const OfferAnalysisSchema = z.object({
  entidad: z.string(),
  montoOriginal: z.number(),
  montoOfrecido: z.number(),
  quitaPorcentaje: z.number(),
  tasaEfectiva: z.number().nullable(),
  cuotas: z.number().nullable(),
  recomendacion: z.enum(["conviene", "revisar", "no_conviene"]),
  resumen: z.string(),
});

export type OfferAnalysis = z.infer<typeof OfferAnalysisSchema>;

const SYSTEM_PROMPT = `Analizás ofertas de regularización de deuda en Argentina para un usuario
que está evaluando si le conviene aceptarlas.

Te llega el texto de una oferta (de un banco, financiera u otra entidad
acreedora). Extraé:
- entidad: nombre de la entidad que ofrece la regularización
- montoOriginal: deuda original en pesos (ARS), antes de la oferta
- montoOfrecido: monto que terminaría pagando el usuario si acepta
- quitaPorcentaje: (montoOriginal - montoOfrecido) / montoOriginal * 100
- tasaEfectiva: tasa efectiva anual si la oferta es un plan de cuotas con
  interés; null si es un pago único o el texto no la menciona
- cuotas: cantidad de cuotas si aplica; null si es pago único
- recomendacion: "conviene" | "revisar" | "no_conviene"
- resumen: 2-3 oraciones en español explicando la recomendación

Reglas importantes:
- No inventes números que no estén en el texto. Si un dato no está
  presente o es ambiguo, usá null en el campo correspondiente (para
  tasaEfectiva/cuotas) o, si falta un dato obligatorio como el monto
  original u ofrecido, usá recomendacion: "revisar" y explicá en el
  resumen qué información falta para poder evaluar la oferta.
- Los montos van en pesos argentinos (ARS), sin separadores de miles.`;

let client: Anthropic | undefined;

function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export async function analyzeOffer(offerText: string): Promise<OfferAnalysis> {
  if (!offerText.trim()) {
    throw new Error("analyzeOffer: offerText no puede estar vacío");
  }

  const response = await getClient().messages.parse({
    model: "claude-opus-5",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: offerText }],
    output_config: { format: zodOutputFormat(OfferAnalysisSchema) },
  });

  if (!response.parsed_output) {
    throw new Error(
      "analyzeOffer: Claude no devolvió un análisis parseable para esta oferta"
    );
  }

  return response.parsed_output;
}
