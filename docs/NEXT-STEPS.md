# Próximos pasos: de este repo a una app que la gente pueda usar

Este documento resume qué falta para que alguien fuera de este repo pueda
entrar a la app, ver su deuda y aceptar una oferta — y cómo hacerlo de una
forma amigable para el usuario, dado que el tema (deuda, DNI) es sensible.

## 1. Dónde desplegarla

**Recomendación: [Vercel](https://vercel.com).** Es la plataforma que hace
el equipo de Next.js, así que el deploy es prácticamente sin configuración:

1. Conectar el repo de GitHub (`diegogonzalez1092/Deuda-App`) a un proyecto
   de Vercel.
2. Cargar las variables de `.env.example` en Vercel → Project Settings →
   Environment Variables (con los valores reales, no los placeholders).
3. Cada push a `main` despliega a producción automáticamente; cada PR
   genera una URL de preview para probar cambios antes de mergear — muy
   útil para revisar el look & feel con alguien no técnico antes de que
   algo llegue a usuarios reales.
4. Dominio propio: Vercel permite conectar un dominio comprado en cualquier
   registrador (para `.com.ar` es a través de [NIC.ar](https://nic.ar)) y
   te da HTTPS automático.

Alternativas razonables si preferís no depender de Vercel: Railway o
Render (tienen buen soporte para Next.js + Postgres administrado en el
mismo lugar). No hace falta decidir esto ahora — el código no tiene nada
específico de Vercel.

### Base de datos

Todavía no hay ninguna implementada (ver `docs/ARCHITECTURE.md`, Fase 2).
Opciones administradas que funcionan bien con Postgres + Vercel:
[Neon](https://neon.tech) o [Supabase](https://supabase.com) (ambas tienen
plan gratuito para empezar) — cualquiera de las dos te da un
`DATABASE_URL` que se pega directo en `.env`.

## 2. Bloqueantes antes de un lanzamiento público

Estos no son técnicos — son decisiones/gestiones que hay que resolver
antes de mostrarle la app a un usuario real:

| Bloqueante | Módulo | Qué hace falta |
|---|---|---|
| Verificación de identidad real | `src/auth` | Elegir un proveedor de KYC (`MockIdentityProvider` no verifica nada real) |
| Credenciales de producción de Mercado Pago | `src/payments` | Cuenta de Mercado Pago habilitada para cobrar + probar con credenciales de test primero |
| Al menos 1 entidad cargando ofertas | `src/marketplace` | Acuerdo comercial — sin esto no hay catálogo de ofertas (`getActiveOffers()` está sin implementar a propósito) |
| Checklist legal | `docs/LEGAL-NOTES.md` | Revisión con abogado — obligatorio antes de producción, en especial para `negotiation` |

Mientras estos no estén resueltos, la recomendación (ya en el README) es
lanzar el MVP solo con **Fases 1-3**: monitoreo de deuda (`bcra-sync` +
`dashboard`) primero, sumando `marketplace` + `payments` en cuanto haya
al menos una entidad con ofertas cargadas. `ai-analysis` y `negotiation`
quedan para después.

## 3. Hacerla amigable para el usuario

Es una app que le pide el DNI/CUIT a alguien para mostrarle que tiene
deudas — el tono y la UX importan tanto como que funcione:

- **Mostrar valor antes de pedir datos.** No arrancar pidiendo el DNI. Una
  landing que explique en 3 pasos simples cómo funciona ("mirá tu
  situación gratis → si hay una oferta, la ves clara → pagás online, sin
  vueltas") genera más confianza que un formulario de entrada.
- **Transparencia sobre privacidad, arriba de todo.** Como el dato es
  sensible, una línea visible tipo "no compartimos tu información con
  nadie más que la entidad de tu deuda" o similar (una vez que sea
  legalmente exacto, ver `LEGAL-NOTES.md`) reduce el abandono en el paso
  de verificación de identidad.
- **Mobile-first.** La mayoría va a entrar desde el celular — el
  componente `CreditHealthSummary` ya usa colores + texto (no solo color)
  para la situación 1-5, lo cual también ayuda a accesibilidad.
- **Lenguaje simple, no jerga bancaria.** "Debés $150.000 al Banco X, hay
  una oferta para pagar $105.000" en vez de "situación 2, financiación
  vigente, quita del 30%".
- **CTA claro por oferta.** Un botón grande de "Pagar $X ahora" por
  oferta, no una tabla comparativa densa.
- **Notificaciones por el canal que la gente realmente mira.** Alertas de
  cambio de situación por email + WhatsApp (muy usado en Argentina) suman
  más que solo notificaciones push del navegador — está anotado como TODO
  en `src/dashboard/README.md`.
- **No cobrar nada por adelantado.** Igual que el modelo de Ponete al Día
  que inspiró este proyecto (ver README principal): el monitoreo es
  gratis, se cobra (o la entidad paga comisión) solo cuando el usuario
  efectivamente regulariza. Dejarlo explícito en la landing baja la
  fricción de entrada.
- **Analytics + monitoreo de errores desde el día 1**, aunque sea
  simple — [Vercel Analytics](https://vercel.com/analytics) o
  [Plausible](https://plausible.io) para entender en qué paso abandona la
  gente (típicamente: verificación de identidad), y algo como
  [Sentry](https://sentry.io) para enterarte de errores en producción
  antes que un usuario te escriba para avisar.

Nada de esto bloquea el desarrollo técnico — se puede ir iterando el copy
y el diseño en paralelo mientras se resuelven los bloqueantes de la
sección 2.
