# dashboard

Vista de salud crediticia del usuario: situación 1-5, deudas activas,
histórico, alertas cuando cambia algo.

## Estado

`CreditHealthSummary.tsx` es un componente React puro (no hace fetch) que
muestra:

- La peor situación (1-5) entre las financiaciones activas del usuario
- Cada financiación con su entidad, monto y situación
- La oferta de marketplace vigente para esa entidad, si existe

Se renderiza en `app/dashboard/page.tsx` (Server Component) con la deuda
real del usuario: lee la sesión de `src/auth/session.ts`, llama a
`getDeudaSnapshot()` y `matchOffersToUser()` en el servidor, y si el BCRA
falla muestra un error en vez de romper la página. El flujo completo es
`/` → `/consulta` (entra DNI + email, ver `src/auth/README.md`) →
`/dashboard`.

Todavía no hay "evolución en el tiempo" — eso requiere guardar snapshots
históricos de `bcra-sync` en una DB, que no existe todavía.

## TODO

- [ ] Evolución en el tiempo (requiere guardar histórico en DB)
- [ ] Sistema de alertas (email/push) cuando bcra-sync detecta un cambio
      de situación o una deuda nueva
