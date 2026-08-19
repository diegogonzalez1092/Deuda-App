# auth

Registro y verificación de identidad.

Requisito clave: el usuario debe poder consultar y monitorear **solo su
propia** deuda. El formulario no puede ser "tipeá cualquier DNI" — hace
falta un paso de verificación real (ej. validación contra RENAPER, o un
proveedor de verificación de identidad biométrica/documento) antes de dejar
que un DNI/CUIT quede vinculado a una cuenta.

## TODO (Claude Code)

- [ ] Definir proveedor de verificación de identidad (RENAPER API, o un
      servicio de KYC de terceros — comparar costos y cobertura)
- [ ] Flujo de registro: datos básicos → carga de DNI (foto/OCR o dato) →
      verificación → cuenta activada
- [ ] Sesión/autenticación (ej. NextAuth si el stack es Next.js)
- [ ] Encriptar el DNI/CUIT at-rest en la base de datos, no guardarlo en texto plano
