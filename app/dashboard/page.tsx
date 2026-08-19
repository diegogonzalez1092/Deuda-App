import { redirect } from "next/navigation";
import { getSession } from "../../src/auth/session";
import { getDeudaSnapshot } from "../../src/bcra-sync/client";
import { matchOffersToUser, type Offer } from "../../src/marketplace/offers";
import type { DeudaSnapshot } from "../../src/bcra-sync/types";
import { CreditHealthSummary } from "../../src/dashboard/CreditHealthSummary";
import { cerrarSesion } from "./actions";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/consulta");
  }

  let deuda: DeudaSnapshot | null = null;
  let ofertas: Offer[] = [];
  let error: string | null = null;

  try {
    // No hay catálogo de ofertas todavía (ver marketplace/README y
    // getActiveOffers en offers.ts) — pasamos [] explícitamente en vez de
    // dejar que matchOffersToUser intente traerlo y falle.
    [deuda, ofertas] = await Promise.all([
      getDeudaSnapshot(session.identificacion),
      matchOffersToUser(session.identificacion, []),
    ]);
  } catch (err) {
    error =
      err instanceof Error
        ? `No pudimos consultar el BCRA: ${err.message}`
        : "No pudimos consultar el BCRA. Probá de nuevo en unos minutos.";
  }

  return (
    <main className="page">
      <p className="disclaimer">
        Consultando: {session.identificacion} · {session.email}
      </p>

      {error && <p className="form-error">{error}</p>}
      {deuda && <CreditHealthSummary deuda={deuda} ofertas={ofertas} />}

      <form action={cerrarSesion} style={{ marginTop: "1.5rem" }}>
        <button type="submit" className="btn btn-secondary">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
