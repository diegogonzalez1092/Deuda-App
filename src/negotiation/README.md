# negotiation (15% — gestoría activa)

Módulo de negociación caso por caso. Se ofrece solo cuando el marketplace
no tiene una oferta que le sirva al usuario, o cuando lo pide explícitamente.

**Este módulo está feature-flagged y desactivado por defecto**
(`ENABLE_NEGOTIATION=false` en `.env`). No desplegar a producción hasta
resolver los puntos de `docs/LEGAL-NOTES.md`.

## Flujo previsto

1. Usuario pide gestoría activa para una deuda sin oferta de marketplace
2. Se crea un "caso" con los datos de la deuda
3. `ai-analysis` sugiere un rango de negociación (piso/techo) basado en:
   - antigüedad de la mora
   - situación BCRA (1-5)
   - casos previos similares (una vez que haya histórico)
4. Un humano (abogado/gestor matriculado, según defina el equipo legal)
   toma la sugerencia y negocia con la entidad
5. Si hay acuerdo, se carga como una "oferta" puntual y sigue el flujo normal
   de pago

## Estado

`cases.ts` implementa el modelo de datos y el ciclo de vida del caso:

- `openCase()` — abre un caso para una deuda real del usuario (verificada
  contra `bcra-sync`), anota si ya existe una oferta de marketplace para esa
  entidad
- `addMessage()` / `closeCase()` — transiciones de estado
  (abierto → en_negociacion → cerrado)
- Cada función chequea `negotiationEnabled()` (`process.env.ENABLE_NEGOTIATION`)
  y lanza `NegotiationDisabledError` si está apagado — que es el default

No hay persistencia todavía: las funciones son puras (reciben/devuelven
`NegotiationCase`, no lo guardan en ningún lado) hasta que exista una DB.
El rango de negociación sugerido por IA (piso/techo, punto 3 del flujo
previsto arriba) tampoco está implementado — `ai-analysis/offerAnalyzer.ts`
hoy analiza ofertas ya existentes, no sugiere una contraoferta.

## TODO

- [ ] Persistencia de `NegotiationCase` en DB
- [ ] Extender `ai-analysis` para sugerir rango de negociación piso/techo
- [ ] Bloquear las rutas de API en el frontend cuando el flag está apagado
      (la lógica de bloqueo ya existe en `cases.ts`, falta la capa HTTP)
- [ ] Panel simple para que el gestor humano vea los casos abiertos y
      cargue el resultado de la negociación
