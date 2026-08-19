/**
 * Marketplace de ofertas pre-cargadas por entidades acreedoras.
 * Este es el 85% del producto — el flujo principal, sin negociación humana.
 *
 * Modelo (igual al de ponetealdia.com): la entidad acreedora carga sus
 * propias condiciones de descuento/plan de pago. La app solo muestra,
 * matchea contra la deuda real del usuario (via bcra-sync), y cobra.
 *
 * TODO (Claude Code):
 *   - Panel simple para que la entidad cargue/edite sus ofertas (Fase 3,
 *     depende de tener acuerdos comerciales — ver docs/ARCHITECTURE.md)
 */

import { getDeudaSnapshot } from "../bcra-sync/client";
import type { Financiacion } from "../bcra-sync/types";

export interface Offer {
  id: string;
  entidad: string;
  aplicaA: string; // identificador de la financiación/deuda original
  descuentoPorcentaje: number;
  vigenciaHasta: string; // ISO date
  condiciones: string;
}

function normalizarEntidad(nombre: string): string {
  return nombre.trim().toLowerCase();
}

export function ofertaVigente(offer: Offer, ahora: Date = new Date()): boolean {
  return new Date(offer.vigenciaHasta).getTime() >= ahora.getTime();
}

/**
 * Una oferta aplica a una financiación si es de la misma entidad acreedora.
 * La Central de Deudores del BCRA no expone un id de préstamo/producto
 * individual — solo entidad + situación + monto agregado por entidad — así
 * que el matching es a nivel entidad: si el banco/financiera tiene una
 * oferta activa y el usuario tiene deuda registrada con esa entidad, la
 * oferta aplica.
 */
export function ofertaAplicaAFinanciacion(offer: Offer, financiacion: Financiacion): boolean {
  return normalizarEntidad(offer.entidad) === normalizarEntidad(financiacion.entidad);
}

/**
 * Catálogo de ofertas activas cargadas por entidades acreedoras.
 *
 * TODO (Fase 3, ver docs/ARCHITECTURE.md): todavía no hay base de datos ni
 * acuerdos comerciales con entidades, así que no hay de dónde traer el
 * catálogo real. Implementar contra la DB (Postgres, según README) una vez
 * que exista al menos una entidad cargando ofertas.
 */
export async function getActiveOffers(): Promise<Offer[]> {
  throw new Error(
    "getActiveOffers: not implemented — no hay catálogo de ofertas todavía (Fase 3)"
  );
}

/**
 * Cruza las deudas reales del usuario (traídas de bcra-sync) contra el
 * catálogo de ofertas activas y devuelve solo las que aplican a alguna
 * financiación real del usuario y siguen vigentes.
 *
 * @param identificacion CUIT/CUIL/CDI del usuario.
 * @param catalogo Catálogo de ofertas a usar. Si no se pasa, se trae con
 *   getActiveOffers() (todavía no implementado — ver TODO arriba). Pasarlo
 *   explícitamente permite testear el matching sin depender de la DB.
 */
export async function matchOffersToUser(
  identificacion: string,
  catalogo?: Offer[]
): Promise<Offer[]> {
  const [deuda, ofertas] = await Promise.all([
    getDeudaSnapshot(identificacion),
    catalogo ?? getActiveOffers(),
  ]);

  const ahora = new Date();

  return ofertas.filter(
    (offer) =>
      ofertaVigente(offer, ahora) &&
      deuda.financiaciones.some((financiacion) => ofertaAplicaAFinanciacion(offer, financiacion))
  );
}
