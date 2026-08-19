/**
 * Checkout de la oferta elegida vía Mercado Pago (Checkout Pro).
 *
 * NOTA: no se pudo probar contra una cuenta real desde este entorno — hace
 * falta un PAYMENTS_API_KEY (access token) real de Mercado Pago (ver
 * .env.example) para verificarlo end-to-end. La forma de las llamadas está
 * chequeada contra los tipos publicados por el SDK oficial `mercadopago`
 * (Node, v2) instalado en el proyecto, no adivinada — pero el flujo
 * completo (crear preferencia → pagar → recibir webhook) no corrió nunca
 * contra la API real. Probarlo con credenciales de test antes de producción.
 */

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { Checkout, CrearCheckoutParams, EstadoPago, PaymentProvider } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} no está configurado (ver .env.example)`);
  return value;
}

export class MercadoPagoProvider implements PaymentProvider {
  private readonly config: MercadoPagoConfig;

  constructor(accessToken: string = requireEnv("PAYMENTS_API_KEY")) {
    this.config = new MercadoPagoConfig({ accessToken });
  }

  async crearCheckout(params: CrearCheckoutParams): Promise<Checkout> {
    const preference = new Preference(this.config);

    const resultado = await preference.create({
      body: {
        items: [
          {
            id: params.ofertaId,
            title: params.descripcion,
            quantity: 1,
            unit_price: params.monto,
            currency_id: "ARS",
          },
        ],
        payer: { email: params.emailComprador },
        external_reference: params.ofertaId,
        back_urls: {
          success: process.env.PAYMENTS_SUCCESS_URL,
          failure: process.env.PAYMENTS_FAILURE_URL,
          pending: process.env.PAYMENTS_PENDING_URL,
        },
        auto_return: "approved",
      },
    });

    if (!resultado.id || !resultado.init_point) {
      throw new Error(
        "MercadoPagoProvider.crearCheckout: la respuesta no incluyó id/init_point"
      );
    }

    return {
      id: resultado.id,
      ofertaId: params.ofertaId,
      monto: params.monto,
      urlPago: resultado.init_point,
      estado: "pendiente",
    };
  }

  /**
   * Mercado Pago manda la notificación de webhook con { type: "payment",
   * data: { id } } y NO el estado — hay que ir a buscar el pago por id
   * para saber si se aprobó.
   */
  async procesarWebhook(payload: unknown): Promise<{ ofertaId: string; estado: EstadoPago }> {
    const notificacion = payload as { type?: string; data?: { id?: string } };
    if (notificacion.type !== "payment" || !notificacion.data?.id) {
      throw new Error("MercadoPagoProvider.procesarWebhook: payload con shape inesperado");
    }

    const payment = new Payment(this.config);
    const detalle = await payment.get({ id: notificacion.data.id });

    if (!detalle.external_reference) {
      throw new Error(
        "MercadoPagoProvider.procesarWebhook: el pago no tiene external_reference " +
          "(debería ser el ofertaId seteado en crearCheckout)"
      );
    }

    return {
      ofertaId: detalle.external_reference,
      estado: mapEstado(detalle.status),
    };
  }
}

function mapEstado(status: string | undefined): EstadoPago {
  switch (status) {
    case "approved":
      return "aprobado";
    case "rejected":
      return "rechazado";
    case "in_process":
    case "pending":
      return "en_proceso";
    default:
      return "pendiente";
  }
}
