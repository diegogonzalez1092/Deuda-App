# Debt App — Plataforma de regularización de deudas

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdiegogonzalez1092%2FDeuda-App%2Ftree%2Fclaude%2Fclaude-md-docs-gorteu&project-name=deuda-app&repository-name=deuda-app)

App para monitorear deuda morosa vía identificación nacional (DNI/CUIT/CUIL) y
resolverla mediante dos modelos combinados:

- **85% Marketplace** — ofertas de descuento pre-cargadas por entidades acreedoras.
  El usuario elige y paga online. Sin negociación humana, 100% automatizable.
- **15% Gestoría activa** — negociación caso por caso, a demanda del cliente,
  con supervisión humana. Se activa solo cuando el marketplace no tiene una
  oferta que le sirva al usuario.

Inspirado en el modelo de [ponetealdia.com](https://ponetealdia.com) (Alprestamo +
Equifax), que funciona como canal/intermediario y no como negociador directo.

## Por qué 85/15

El marketplace es el corazón del producto porque:
- No requiere habilitación como gestor de cobranza (menor riesgo legal/regulatorio)
- Es escalable con software puro, sin equipo humano por caso
- Es el mismo modelo que ya validó Ponete al Día en Argentina

La gestoría activa se ofrece como upsell opcional, visible solo cuando:
1. El usuario no tiene ninguna oferta de marketplace disponible para su deuda, o
2. El usuario pide explícitamente negociar condiciones distintas a las publicadas

Ver [`docs/LEGAL-NOTES.md`](docs/LEGAL-NOTES.md) — la gestoría activa NO se
despliega a producción hasta validación legal.

## Estructura del repo

```
debt-app/
├── app/                 # App Router de Next.js (layout.tsx, page.tsx)
├── src/
│   ├── auth/            # Registro, verificación de identidad (DNI propio, no de terceros)
│   ├── bcra-sync/       # Cliente de la API pública del BCRA (Central de Deudores)
│   ├── ai-analysis/     # Motor IA: analiza ofertas vía la API de Claude
│   ├── marketplace/     # Catálogo de ofertas pre-cargadas por entidades + matching
│   ├── negotiation/     # Gestoría activa (15%) — flujo asistido/humano, feature-flagged
│   ├── payments/        # Checkout vía Mercado Pago
│   └── dashboard/       # Vista de salud crediticia del usuario (situación 1-5)
├── docs/
│   ├── ARCHITECTURE.md  # Decisiones técnicas y flujo de datos
│   ├── LEGAL-NOTES.md   # Qué falta validar antes de habilitar cada módulo
│   └── NEXT-STEPS.md    # Deploy, bloqueantes antes de producción, UX
├── package.json
└── .env.example
```

## Cómo correrla localmente

```
npm install
npm run dev
```

Abre `http://localhost:3000` — muestra el dashboard con datos de ejemplo
(no hay sesión ni base de datos conectada todavía, ver
[`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md)).

## Fases de desarrollo

| Fase | Qué se construye | Depende de |
|---|---|---|
| 1 | `bcra-sync` + `dashboard` (monitoreo de deuda) | Nada — API pública del BCRA |
| 2 | `auth` con verificación real de identidad | Proveedor de verificación (ej. validación biométrica/DNI) |
| 3 | `marketplace` + `payments` | Acuerdos comerciales con al menos 1 entidad acreedora |
| 4 | `ai-analysis` | Fases 1-3 en funcionamiento, casos reales para calibrar el benchmark |
| 5 | `negotiation` (15%) | Revisión legal completa — ver `docs/LEGAL-NOTES.md` |

Recomendación: lanzar MVP con fases 1-3 únicamente. `ai-analysis` y
`negotiation` se suman después de tener tracción y feedback real.

## Cómo seguir con Claude Code

Cloná este repo y desde la raíz corré Claude Code para continuar cada módulo,
por ejemplo:

```
cd debt-app
claude "implementá el cliente de src/bcra-sync/client.ts para que llame a
los 3 endpoints documentados en el comentario del archivo y devuelva los
datos ya tipados"
```

Cada carpeta de `src/` tiene un archivo con la interfaz/esqueleto y comentarios
explicando qué falta implementar — son el punto de partida para Claude Code.

## Stack sugerido

- **Frontend/backend**: Next.js (TypeScript) — permite API routes y app web en un
  solo repo, fácil de desplegar
- **Base de datos**: Postgres, con cifrado at-rest para DNI/CUIT y datos de deuda
- **IA**: API de Claude (Anthropic) para `ai-analysis`
- **Pagos**: a definir según el país (Mercado Pago es lo más común en Argentina)

No es un stack cerrado — ajustalo según lo que ya conozcas vos o tu equipo.

## Deploy y próximos pasos

Ver [`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md): dónde desplegarla (Vercel +
Postgres administrado), qué bloqueantes no técnicos hay que resolver antes
de un lanzamiento público (proveedor de KYC, credenciales de Mercado Pago,
al menos una entidad cargando ofertas, checklist legal), y recomendaciones
de UX para que la app sea amigable dado que maneja datos sensibles (DNI,
deuda).
