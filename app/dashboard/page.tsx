import { redirect } from "next/navigation";
import { getSession } from "../../src/auth/session";
import { getDeudaSnapshot } from "../../src/bcra-sync/client";
import { matchOffersToUser, type Offer } from "../../src/marketplace/offers";
import type { DeudaSnapshot } from "../../src/bcra-sync/types";
import { getDolarOficial, type DolarOficial } from "../../src/fx/dolarOficial";
import { CreditHealthSummary } from "../../src/dashboard/CreditHealthSummary";
import { cerrarSesion } from "./actions";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/consulta");
  }

  let deuda: DeudaSnapshot | null = null;
  let error: string | null = null;

  // No hay catálogo de ofertas todavía (ver marketplace/README y
  // getActiveOffers en offers.ts) ni garantía de que dolarapi.com esté
  // arriba — se resuelven con allSettled para que una falla ahí no tire
  // abajo la parte que sí importa: la deuda del BCRA.
  const [deudaResult, ofertasResult, dolarResult] = await Promise.allSettled([
    getDeudaSnapshot(session.identificacion),
    matchOffersToUser(session.identificacion, []),
    getDolarOficial(),
  ]);

  if (deudaResult.status === "fulfilled") {
    deuda = deudaResult.value;
  } else {
    const err = deudaResult.reason;
    error =
      err instanceof Error
        ? `No pudimos consultar el BCRA: ${err.message}`
        : "No pudimos consultar el BCRA. Probá de nuevo en unos minutos.";
  }

  const ofertas: Offer[] = ofertasResult.status === "fulfilled" ? ofertasResult.value : [];
  const dolar: DolarOficial | null = dolarResult.status === "fulfilled" ? dolarResult.value : null;

  return (
    <main className="page">
      <p className="disclaimer">
        Consultando: {session.identificacion} · {session.email}
        {session.origen === "dni" && " · CUIL calculado a partir de tu DNI"}
      </p>

      {error && <p className="form-error">{error}</p>}
      {deuda && <CreditHealthSummary deuda={deuda} ofertas={ofertas} dolar={dolar} />}

      <form action={cerrarSesion} style={{ marginTop: "1.5rem" }}>
        <button type="submit" className="btn btn-secondary">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
