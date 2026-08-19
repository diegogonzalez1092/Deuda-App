# payments

Checkout de la oferta elegida (marketplace o negociación cerrada).

## TODO (Claude Code)

- [ ] Elegir proveedor de pago (Mercado Pago es el más común en Argentina
      para este tipo de flujo)
- [ ] Flujo: usuario elige oferta -> checkout -> confirmación -> se marca
      la deuda como "en proceso de pago" -> webhook de confirmación ->
      se marca "cancelada" y se genera comprobante
- [ ] Definir qué pasa si el pago falla o se acredita parcialmente
