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

## TODO

- [ ] Elegir proveedor de verificación real (KYC de terceros — comparar
      costos y cobertura en Argentina — o iniciar el trámite de convenio
      con RENAPER si el volumen lo justifica) e implementar
      `IdentityVerificationProvider` contra su API
- [ ] Capa de persistencia (`DATABASE_URL`, ver `.env.example`) con el
      DNI/CUIT encriptado at-rest — `registerUser()` todavía no persiste
      nada, devuelve el `Usuario` en memoria
- [ ] Sesión/autenticación (ej. NextAuth) una vez que haya persistencia
