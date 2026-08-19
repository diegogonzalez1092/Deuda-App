import { CreditHealthSummary } from "../src/dashboard/CreditHealthSummary";
import type { DeudaSnapshot } from "../src/bcra-sync/types";
import type { Offer } from "../src/marketplace/offers";

/**
 * Datos de ejemplo (NO de un usuario real — ver docs/LEGAL-NOTES.md sobre
 * nunca mostrar el DNI/CUIT de un tercero) para poder ver el dashboard
 * renderizado con `npm run dev` sin depender de sesión ni base de datos.
 *
 * TODO: reemplazar por la deuda del usuario autenticado — llamar a
 * getDeudaSnapshot(identificacion) y matchOffersToUser(identificacion)
 * server-side (route handler o Server Component) una vez que exista
 * sesión real (ver src/auth) y persistencia (ver docs/ARCHITECTURE.md
 * Fase 2).
 */
const deudaEjemplo: DeudaSnapshot = {
  identificacion: "20304050607",
  fechaConsulta: new Date().toISOString(),
  chequesRechazados: false,
  financiaciones: [
    {
      entidad: "Banco Ejemplo",
      situacion: 2,
      monto: 150000,
      moneda: "ARS",
      fechaInforme: "2026-07-01",
    },
    {
      entidad: "Financiera Ejemplo",
      situacion: 4,
      monto: 80000,
      moneda: "ARS",
      fechaInforme: "2026-07-01",
    },
  ],
};

const ofertasEjemplo: Offer[] = [
  {
    id: "oferta-ejemplo-1",
    entidad: "Financiera Ejemplo",
    aplicaA: "Financiera Ejemplo",
    descuentoPorcentaje: 30,
    vigenciaHasta: "2027-01-01",
    condiciones: "Pago único con 30% de descuento",
  },
];

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Debt App</h1>
      <p>Vista de ejemplo — todavía no está conectada a un usuario real.</p>
      <CreditHealthSummary deuda={deudaEjemplo} ofertas={ofertasEjemplo} />
    </main>
  );
}
