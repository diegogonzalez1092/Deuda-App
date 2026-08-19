export type EstadoPago = "pendiente" | "en_proceso" | "aprobado" | "rechazado";

export interface Checkout {
  id: string;
  ofertaId: string;
  monto: number;
  urlPago: string; // link de checkout al que se redirige al usuario
  estado: EstadoPago;
}

export interface CrearCheckoutParams {
  ofertaId: string;
  monto: number;
  descripcion: string;
  emailComprador: string;
}

export interface PaymentProvider {
  crearCheckout(params: CrearCheckoutParams): Promise<Checkout>;
  /** Procesa la notificación de webhook y devuelve el nuevo estado de la oferta pagada. */
  procesarWebhook(payload: unknown): Promise<{ ofertaId: string; estado: EstadoPago }>;
}
