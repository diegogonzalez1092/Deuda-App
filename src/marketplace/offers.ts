/**
 * Marketplace de ofertas pre-cargadas por entidades acreedoras.
 * Este es el 85% del producto — el flujo principal, sin negociación humana.
 *
 * Modelo (igual al de ponetealdia.com): la entidad acreedora carga sus
 * propias condiciones de descuento/plan de pago. La app solo muestra,
 * matchea contra la deuda real del usuario (via bcra-sync), y cobra.
 *
 * TODO (Claude Code):
 *   1. Modelo de datos de Offer (entidad, deuda a la que aplica, % descuento,
 *      plazo de vigencia, condiciones)
 *   2. Función matchOffersToUser(deudaSnapshot) -> Offer[] que cruza las
 *      financiaciones activas del usuario contra el catálogo
 *   3. Panel simple para que la entidad cargue/edite sus ofertas (fase 3)
 */

export interface Offer {
  id: string;
  entidad: string;
  aplicaA: string; // identificador de la financiación/deuda original
  descuentoPorcentaje: number;
  vigenciaHasta: string; // ISO date
  condiciones: string;
}

export async function matchOffersToUser(identificacion: string): Promise<Offer[]> {
  // TODO: 1) traer deudaSnapshot desde bcra-sync
  //       2) consultar catálogo de ofertas activas
  //       3) devolver solo las que aplican a deudas reales del usuario
  throw new Error("not implemented");
}
