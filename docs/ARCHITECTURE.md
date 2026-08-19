# Arquitectura

## Flujo de datos (alto nivel)

1. **Registro** (`src/auth`) — usuario se registra con su propio DNI/CUIT,
   pasa verificación de identidad.
2. **Sync BCRA** (`src/bcra-sync`) — job que consulta la API pública del BCRA
   por el CUIT/CUIL/CDI del usuario y guarda un snapshot en base de datos.
3. **Dashboard** (`src/dashboard`) — muestra situación crediticia (1 a 5),
   deudas activas, histórico, y dispara alertas cuando hay cambios.
4. **Marketplace** (`src/marketplace`) — cruza las deudas del usuario contra
   el catálogo de ofertas activas cargadas por entidades acreedoras.
5. **Análisis IA** (`src/ai-analysis`) — cuando hay una oferta, la IA la
   parsea (texto/PDF) y calcula tasa efectiva y quita real, para mostrarle al
   usuario si conviene.
6. **Negociación** (`src/negotiation`, 15%) — si no hay oferta de marketplace
   que le sirva al usuario y lo pide explícitamente, se abre un caso de
   gestoría activa (feature-flagged, ver `LEGAL-NOTES.md`).
7. **Pago** (`src/payments`) — checkout de la oferta elegida.

## Por qué esta separación de carpetas

Cada módulo es independiente a propósito:

- `bcra-sync` no depende de nada más — se puede construir y probar solo,
  es la base del monitoreo.
- `marketplace` y `negotiation` están separados aunque comparten el concepto
  de "oferta", porque tienen ciclos de vida y riesgo regulatorio distintos.
  `negotiation` debe poder desactivarse por completo sin tocar el resto.
- `ai-analysis` es un servicio que consumen tanto `marketplace` (para explicar
  una oferta) como `negotiation` (para sugerir una contraoferta) — no está
  atado a ninguno de los dos.

## Feature flags

`negotiation` se gatea con una variable de entorno (`ENABLE_NEGOTIATION=false`
por defecto). Esto permite tener el código en el repo y probarlo en
desarrollo sin exponerlo a usuarios reales hasta validación legal.
