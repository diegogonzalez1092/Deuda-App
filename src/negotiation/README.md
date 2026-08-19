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

## TODO (Claude Code)

- [ ] Modelo de datos `NegotiationCase` (estado: abierto/en negociación/
      cerrado, historial de mensajes/ofertas)
- [ ] Feature flag: leer `process.env.ENABLE_NEGOTIATION`, si es `false`
      ocultar la opción en el frontend y bloquear las rutas de API
- [ ] Panel simple para que el gestor humano vea los casos abiertos y
      cargue el resultado de la negociación
