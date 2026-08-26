# auth

Registro y verificación de identidad.

Requisito clave: el usuario debe poder consultar y monitorear **solo su
propia** deuda. El formulario no puede ser "tipeá cualquier DNI" — hace
falta un paso de verificación real (ej. validación contra RENAPER, o un
proveedor de verificación de identidad biométrica/documento) antes de dejar
que un DNI/CUIT quede vinculado a una cuenta.

## Estado

`registerUser()` (en `register.ts`) valida formato de CUIT/CUIL/CDI y
email, y exige pasar por un `IdentityVerificationProvider` antes de crear
la cuenta — así que el flujo básico está, pero el proveedor real de
verificación **no está resuelto todavía**:

- `MockIdentityProvider` (en `register.ts`) es solo para dev/testing:
  aprueba cualquier identificación con formato válido, sin verificar nada
  real. **No usar en producción.**
- RENAPER no tiene una API pública de autoservicio — requiere convenio
  institucional con el Estado argentino, algo que no se resuelve en código.
  La alternativa más rápida para un MVP es un proveedor privado de KYC
  (validación biométrica + OCR de DNI).

## Sesión sin contraseña ("DNI-first")

`session.ts` implementa un modelo de sesión distinto y más simple, usado
por `app/consulta` y `app/dashboard`: no hay cuenta ni contraseña, el
usuario entra su DNI/CUIT/CUIL + email y eso se firma en una cookie
(JWT vía `jose`, `SESSION_SECRET` en `.env.example`). Mismo modelo que
ponetealdia.com — el valor es "mirá gratis tu situación", no una cuenta
tradicional.

Esto es intencionalmente más liviano que `registerUser()`/`Usuario`
arriba: **no verifica identidad**, solo formato. Es una decisión de
producto explícita (ver `docs/NEXT-STEPS.md`) para poder mostrar la app
funcionando sin depender de un proveedor de KYC ni de una base de datos.
La UI (`app/consulta/page.tsx`) deja explícito que la Central de Deudores
del BCRA ya es un dato público — la app no expone nada que no se pudiera
consultar directamente en el sitio del BCRA.

## Consultar con DNI en vez de CUIT/CUIL

`cuil.ts` (`derivarCuil(dni, sexo)`) calcula el CUIL de una persona física
a partir de su DNI + sexo registral, con el algoritmo de dígito
verificador (módulo 11) estándar de AFIP. Es una **heurística, no una
consulta oficial**: cubre el caso normal, pero puede fallar en casos raros
(CUIL provisorio, DNIs muy antiguos). Dos mitigaciones ante ese riesgo:

1. El formulario (`app/consulta`) también acepta CUIT/CUIL directo, por si
   el cálculo no da con la persona correcta.
2. El dashboard muestra la `denominacion` (nombre/razón social) que
   devuelve el BCRA para esa identificación, para que el usuario confirme
   visualmente que la deuda mostrada es la suya.

No se pudo verificar este cálculo contra un validador oficial de AFIP
desde este entorno (mismo bloqueo de red que el resto de las APIs
externas) — la lógica está armada a partir del algoritmo públicamente
documentado del dígito verificador, no de una respuesta real. Si un
usuario reporta que el CUIL calculado no coincide con el suyo, es la
primera señal de que hay que revisar `cuil.ts` con una consulta real.

## TODO

- [ ] Elegir proveedor de verificación real (KYC de terceros — comparar
      costos y cobertura en Argentina — o iniciar el trámite de convenio
      con RENAPER si el volumen lo justifica) e implementar
      `IdentityVerificationProvider` contra su API — necesario recién si
      se agregan cuentas con contraseña persistentes (`registerUser()`)
- [ ] Capa de persistencia (`DATABASE_URL`, ver `.env.example`) con el
      DNI/CUIT encriptado at-rest — `registerUser()` todavía no persiste
      nada, devuelve el `Usuario` en memoria
