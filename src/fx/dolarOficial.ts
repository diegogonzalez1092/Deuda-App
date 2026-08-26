/**
 * Cotización del dólar oficial vía dolarapi.com (API pública, gratuita,
 * fuente Banco Nación). Se usa esta API en vez de scrapear dolarhoy.com
 * directamente porque dolarhoy.com no expone una API pública y su HTML
 * no se pudo inspeccionar desde este entorno (mismo bloqueo de red que
 * la API del BCRA) — decisión confirmada con el usuario. El valor
 * "oficial" que expone dolarapi.com es la misma cotización de
 * referencia que dolarhoy.com muestra en su sección "Dólar Oficial".
 *
 * NOTA: no se pudo verificar contra una respuesta real desde este
 * entorno (dolarapi.com también está bloqueado acá) — shape armado a
 * partir de la documentación pública de dolarapi.com. Confirmar con una
 * consulta real (ej. contra https://dolarapi.com/v1/dolares/oficial)
 * antes de confiar en el shape en producción.
 */

const DOLAR_API_URL = "https://dolarapi.com/v1/dolares/oficial";

export interface DolarOficial {
  compra: number;
  venta: number;
  fechaActualizacion: string; // ISO date
}

export async function getDolarOficial(): Promise<DolarOficial> {
  const res = await fetch(DOLAR_API_URL, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`No se pudo obtener la cotización del dólar oficial (HTTP ${res.status})`);
  }

  const data = (await res.json()) as {
    compra?: number;
    venta?: number;
    fechaActualizacion?: string;
  };

  if (typeof data.venta !== "number" || typeof data.fechaActualizacion !== "string") {
    throw new Error("dolarapi.com devolvió una respuesta con un shape inesperado");
  }

  return {
    compra: typeof data.compra === "number" ? data.compra : data.venta,
    venta: data.venta,
    fechaActualizacion: data.fechaActualizacion,
  };
}

/** Convierte un monto en pesos a dólares usando la punta venta (la que paga un comprador de USD). */
export function pesosAUsd(montoArs: number, dolar: DolarOficial): number {
  return montoArs / dolar.venta;
}
