# Notas legales — pendientes de validar con un abogado

Este documento no es asesoramiento legal. Es una checklist de temas a resolver
con un profesional antes de habilitar cada módulo en producción.

## Aplica a toda la app

- [ ] Ley 25.326 (Protección de Datos Personales): inscripción como responsable
      de base de datos ante la AAIP si corresponde
- [ ] Consentimiento explícito y verificable para consultar el propio DNI/CUIT
      (nunca el de un tercero sin autorización)
- [ ] Política de privacidad y términos y condiciones revisados por abogado
- [ ] Verificación de identidad real en el registro (no solo pedir el número
      de DNI por formulario — hay que confirmar que la persona es quien dice ser)

## Módulo `marketplace` (85%)

- [ ] Confirmar que actuar como canal/intermediario entre entidad acreedora y
      deudor no requiere habilitación especial (este es el modelo de Ponete al
      Día: "no actúa como acreedor ni entidad financiera")
- [ ] Contratos comerciales con cada entidad que carga ofertas: quién define
      condiciones, quién es responsable de la validez de la oferta
- [ ] Definir con cada entidad si la app cobra comisión a la entidad, al
      usuario, o ambos, y dejarlo explícito en los términos

## Módulo `negotiation` (15% — gestoría activa)

- [ ] Validar si negociar en nombre de un deudor frente a bancos/financieras
      requiere registro como gestor de cobranza extrajudicial o similar
- [ ] Revisar Ley de Defensa del Consumidor (24.240) en cuanto a cómo se puede
      contactar y negociar con un deudor
- [ ] Definir el modelo de cobro (fee fijo vs. % de la deuda ahorrada) y que
      sea compatible con la normativa vigente
- [ ] Decidir si este módulo requiere involucramiento de un abogado/gestor
      matriculado en cada negociación, o si puede ser 100% en la app

**Este módulo permanece con feature flag desactivado en producción hasta
que estos puntos estén resueltos.**

## Fuente de datos BCRA

La API de Central de Deudores del BCRA (`api.bcra.gob.ar`) es pública, gratuita
y no requiere autenticación. Igualmente, el hecho de que el dato de origen sea
público no exime de las obligaciones de la Ley 25.326 sobre cómo se
almacena, procesa y expone ese dato dentro de la app.
