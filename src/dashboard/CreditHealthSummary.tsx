import type { DeudaSnapshot, Financiacion, SituacionCrediticia } from "../bcra-sync/types";
import type { Offer } from "../marketplace/offers";
import { ofertaAplicaAFinanciacion, ofertaVigente } from "../marketplace/offers";

const SITUACION_LABEL: Record<SituacionCrediticia, string> = {
  1: "Normal",
  2: "Riesgo bajo",
  3: "Riesgo medio",
  4: "Riesgo alto",
  5: "Irrecuperable",
};

const SITUACION_COLOR: Record<SituacionCrediticia, string> = {
  1: "#16a34a",
  2: "#84cc16",
  3: "#eab308",
  4: "#f97316",
  5: "#dc2626",
};

function peorSituacion(financiaciones: Financiacion[]): SituacionCrediticia | null {
  if (financiaciones.length === 0) return null;
  return financiaciones.reduce<SituacionCrediticia>(
    (peor, f) => (f.situacion > peor ? f.situacion : peor),
    1
  );
}

function formatMonto(monto: number, moneda: string): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: moneda }).format(monto);
}

export interface CreditHealthSummaryProps {
  deuda: DeudaSnapshot;
  ofertas: Offer[];
}

/**
 * Resumen de salud crediticia: situación 1-5 (la peor entre todas las
 * financiaciones activas), deudas activas por entidad, y la oferta de
 * marketplace vigente para cada una, si existe.
 *
 * Componente puro — no hace fetch. El caller (una page/route de Next.js)
 * es responsable de traer el DeudaSnapshot del usuario autenticado y el
 * catálogo de ofertas antes de renderizar esto.
 */
export function CreditHealthSummary({ deuda, ofertas }: CreditHealthSummaryProps) {
  const situacion = peorSituacion(deuda.financiaciones);
  const ofertasVigentes = ofertas.filter((o) => ofertaVigente(o));

  return (
    <section aria-label="Salud crediticia">
      <header>
        <h2>Tu situación crediticia</h2>
        {situacion === null ? (
          <p>No tenés deudas registradas en el BCRA.</p>
        ) : (
          <p style={{ color: SITUACION_COLOR[situacion], fontWeight: "bold" }}>
            {situacion} — {SITUACION_LABEL[situacion]}
          </p>
        )}
        <p>
          Última consulta: {new Date(deuda.fechaConsulta).toLocaleDateString("es-AR")}
          {deuda.chequesRechazados && " · Tenés cheques rechazados registrados"}
        </p>
      </header>

      {deuda.financiaciones.length > 0 && (
        <ul>
          {deuda.financiaciones.map((financiacion, i) => {
            const oferta = ofertasVigentes.find((o) =>
              ofertaAplicaAFinanciacion(o, financiacion)
            );
            return (
              <li
                key={`${financiacion.entidad}-${i}`}
                style={{ borderLeft: `4px solid ${SITUACION_COLOR[financiacion.situacion]}`, paddingLeft: "0.75rem" }}
              >
                <strong>{financiacion.entidad}</strong> —{" "}
                {formatMonto(financiacion.monto, financiacion.moneda)} ·{" "}
                {SITUACION_LABEL[financiacion.situacion]}
                {oferta && (
                  <div>
                    Oferta disponible: {oferta.descuentoPorcentaje}% de descuento —{" "}
                    {oferta.condiciones}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
