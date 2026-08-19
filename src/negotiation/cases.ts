/**
 * Gestoría activa (15%). Todo lo de este archivo queda bloqueado por el
 * feature flag ENABLE_NEGOTIATION — cada función pública lo chequea y
 * lanza NegotiationDisabledError si está apagado (el default en
 * .env.example). No activar en producción hasta resolver la checklist de
 * docs/LEGAL-NOTES.md.
 *
 * No hay capa de persistencia todavía (ver docs/ARCHITECTURE.md Fase 2),
 * así que estas funciones son puras: reciben y devuelven NegotiationCase,
 * no lo guardan. Quien las use decide dónde persistir el resultado.
 */

import { randomUUID } from "node:crypto";
import { getDeudaSnapshot } from "../bcra-sync/client";
import { matchOffersToUser } from "../marketplace/offers";
import type { NegotiationCase, NegotiationMessage } from "./types";

export class NegotiationDisabledError extends Error {
  constructor() {
    super(
      "La gestoría activa está desactivada (ENABLE_NEGOTIATION=false). No se puede " +
        "habilitar hasta resolver la checklist legal en docs/LEGAL-NOTES.md."
    );
    this.name = "NegotiationDisabledError";
  }
}

export function negotiationEnabled(): boolean {
  return process.env.ENABLE_NEGOTIATION === "true";
}

function assertNegotiationEnabled(): void {
  if (!negotiationEnabled()) throw new NegotiationDisabledError();
}

export interface OpenCaseParams {
  identificacionUsuario: string;
  entidad: string;
  /** Catálogo a pasarle a matchOffersToUser — ver marketplace/offers.ts. */
  catalogoOfertas?: Parameters<typeof matchOffersToUser>[1];
}

/**
 * Abre un caso de gestoría activa para la deuda que el usuario tiene con
 * `entidad`. El flujo normal (ver docs/ARCHITECTURE.md) es ofrecer esto
 * solo cuando el marketplace no tiene una oferta vigente para esa deuda —
 * pero no lo bloquea si la tiene, porque el usuario puede pedir
 * explícitamente negociar condiciones distintas a las publicadas.
 */
export async function openCase(params: OpenCaseParams): Promise<NegotiationCase> {
  assertNegotiationEnabled();

  const { identificacionUsuario, entidad, catalogoOfertas } = params;

  const [deuda, ofertasAplicables] = await Promise.all([
    getDeudaSnapshot(identificacionUsuario),
    matchOffersToUser(identificacionUsuario, catalogoOfertas).catch(() => []),
  ]);

  const financiacion = deuda.financiaciones.find(
    (f) => f.entidad.trim().toLowerCase() === entidad.trim().toLowerCase()
  );
  if (!financiacion) {
    throw new Error(
      `openCase: el usuario no tiene deuda registrada con "${entidad}" según BCRA`
    );
  }

  const tieneOfertaMarketplace = ofertasAplicables.some(
    (o) => o.entidad.trim().toLowerCase() === entidad.trim().toLowerCase()
  );

  const mensajes: NegotiationMessage[] = tieneOfertaMarketplace
    ? [
        {
          autor: "gestor",
          texto:
            "Ya hay una oferta de marketplace disponible para esta deuda. Este caso de " +
            "gestoría activa sigue abierto porque el usuario pidió negociar explícitamente.",
          fecha: new Date().toISOString(),
        },
      ]
    : [];

  return {
    id: randomUUID(),
    identificacionUsuario,
    entidad: financiacion.entidad,
    montoDeuda: financiacion.monto,
    estado: "abierto",
    mensajes,
    creadoEn: new Date().toISOString(),
    cerradoEn: null,
  };
}

export function addMessage(
  caso: NegotiationCase,
  mensaje: Omit<NegotiationMessage, "fecha">
): NegotiationCase {
  assertNegotiationEnabled();
  if (caso.estado === "cerrado") {
    throw new Error(`addMessage: el caso ${caso.id} ya está cerrado`);
  }
  return {
    ...caso,
    estado: caso.estado === "abierto" ? "en_negociacion" : caso.estado,
    mensajes: [...caso.mensajes, { ...mensaje, fecha: new Date().toISOString() }],
  };
}

export function closeCase(caso: NegotiationCase): NegotiationCase {
  assertNegotiationEnabled();
  return { ...caso, estado: "cerrado", cerradoEn: new Date().toISOString() };
}
