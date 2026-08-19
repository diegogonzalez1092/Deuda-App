# payments

Checkout de la oferta elegida (marketplace o negociación cerrada).

## Estado

`mercadoPagoProvider.ts` implementa `PaymentProvider` (`types.ts`) contra
Mercado Pago Checkout Pro:

- `crearCheckout()` — crea una `Preference` y devuelve la `urlPago`
  (`init_point`) a la que redirigir al usuario
- `procesarWebhook()` — recibe la notificación `{type: "payment", data:
  {id}}`, busca el pago por id y devuelve el estado mapeado
  (`pendiente`/`en_proceso`/`aprobado`/`rechazado`)

Las llamadas están chequeadas contra los tipos publicados por el SDK
`mercadopago` (Node v2), pero **no se probaron contra una cuenta real** —
este entorno no tiene un `PAYMENTS_API_KEY` de test. Antes de producción,
correr el flujo completo (crear preferencia → pagar con una tarjeta de
prueba → recibir el webhook) contra credenciales de test de Mercado Pago.

## TODO

- [ ] Probar el flujo completo con credenciales de test de Mercado Pago
- [ ] Route handler que reciba el webhook (`POST /api/payments/webhook`) y
      llame a `procesarWebhook()` — hoy la función existe pero no está
      conectada a ningún endpoint HTTP
- [ ] Al aprobarse el pago: marcar la deuda como "cancelada" y generar
      comprobante (depende de la capa de persistencia, ver
      `docs/ARCHITECTURE.md` Fase 2)
- [ ] Definir qué pasa si el pago falla o se acredita parcialmente
