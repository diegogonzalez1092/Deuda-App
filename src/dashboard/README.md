# dashboard

Vista de salud crediticia del usuario: situación 1-5, deudas activas,
histórico, alertas cuando cambia algo.

## Estado

`CreditHealthSummary.tsx` es un componente React puro (no hace fetch) que
muestra:

- La peor situación (1-5) entre las financiaciones activas del usuario
- Cada financiación con su entidad, monto y situación
- La oferta de marketplace vigente para esa entidad, si existe

Se renderiza en `app/page.tsx` con datos de ejemplo (nunca con el DNI/CUIT
de una persona real — ver `docs/LEGAL-NOTES.md`), para poder verlo con
`npm run dev` sin depender de sesión ni base de datos.

Todavía no hay "evolución en el tiempo" — eso requiere guardar snapshots
históricos de `bcra-sync` en una DB, que no existe todavía.

## TODO

- [ ] Conectar con el usuario autenticado real: traer su `DeudaSnapshot` y
      ofertas server-side (route handler o Server Component) en vez de los
      datos de ejemplo de `app/page.tsx`
- [ ] Evolución en el tiempo (requiere guardar histórico en DB)
- [ ] Sistema de alertas (email/push) cuando bcra-sync detecta un cambio
      de situación o una deuda nueva
