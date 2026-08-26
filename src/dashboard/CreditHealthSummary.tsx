import Link from "next/link";
import type { DeudaSnapshot, Financiacion, SituacionCrediticia } from "../bcra-sync/types";
import type { Offer } from "../marketplace/offers";
import { ofertaAplicaAFinanciacion, ofertaVigente } from "../marketplace/offers";
import type { DolarOficial } from "../fx/dolarOficial";
import { pesosAUsd } from "../fx/dolarOficial";

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

function formatUsd(monto: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(monto);
}

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-AR");
}

export interface CreditHealthSummaryProps {
  deuda: DeudaSnapshot;
  ofertas: Offer[];
  /** null si no se pudo obtener la cotización — el monto en USD simplemente no se muestra. */
  dolar: DolarOficial | null;
}

/**
 * Resumen de salud crediticia: situación 1-5 (la peor entre todas las
 * financiaciones activas), deudas activas por entidad (en ARS y, si hay
 * cotización disponible, su equivalente en USD al dólar oficial), fecha
 * aproximada desde la que cada una está en mora, y la oferta de
 * marketplace vigente para cada una, si existe.
 *
 * Componente puro — no hace fetch. El caller (una page/route de Next.js)
 * es responsable de traer el DeudaSnapshot, el catálogo de ofertas y la
 * cotización del dólar antes de renderizar esto.
 */
export function CreditHealthSummary({ deuda, ofertas, dolar }: CreditHealthSummaryProps) {
  const situacion = peorSituacion(deuda.financiaciones);
  const ofertasVigentes = ofertas.filter((o) => ofertaVigente(o));

  return (
    <section aria-label="Salud crediticia">
      <header>
        {deuda.denominacion && (
          <p className="disclaimer">
            Consultando a nombre de: <strong>{deuda.denominacion}</strong> — confirmá que sos
            vos antes de continuar.
          </p>
        )}
        <h2>Tu situación crediticia</h2>
        {situacion === null ? (
          <p>No tenés deudas registradas en el BCRA.</p>
        ) : (
          <p style={{ color: SITUACION_COLOR[situacion], fontWeight: "bold" }}>
            {situacion} — {SITUACION_LABEL[situacion]}
          </p>
        )}
        <p>
          Última consulta: {formatFecha(deuda.fechaConsulta)}
          {deuda.chequesRechazados && " · Tenés cheques rechazados registrados"}
        </p>
        {dolar ? (
          <p className="disclaimer">
            Dólar oficial: {formatMonto(dolar.venta, "ARS")} (fuente: dolarapi.com, actualizado{" "}
            {formatFecha(dolar.fechaActualizacion)})
          </p>
        ) : (
          <p className="disclaimer">No pudimos obtener la cotización del dólar en este momento.</p>
        )}
      </header>

      {deuda.financiaciones.length > 0 && (
        <ul className="situacion-list">
          {deuda.financiaciones.map((financiacion, i) => {
            const oferta = ofertasVigentes.find((o) =>
              ofertaAplicaAFinanciacion(o, financiacion)
            );
            return (
              <li
                key={`${financiacion.entidad}-${i}`}
                style={{
                  borderLeft: `4px solid ${SITUACION_COLOR[financiacion.situacion]}`,
                  paddingLeft: "0.75rem",
                }}
              >
                <strong>{financiacion.entidad}</strong> —{" "}
                {formatMonto(financiacion.monto, financiacion.moneda)}
                {dolar && <> (≈ {formatUsd(pesosAUsd(financiacion.monto, dolar))})</>} ·{" "}
                {SITUACION_LABEL[financiacion.situacion]}
                {financiacion.situacionNormalDesde && (
                  <div className="disclaimer">
                    En situación irregular desde aprox. {formatFecha(financiacion.situacionNormalDesde)}
                    {" "}(última vez informado como situación normal)
                  </div>
                )}
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

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/asesor" className="btn btn-primary">
          Consultar con un asesor
        </Link>
      </div>
    </section>
  );
}
