# Master class: backend, pruebas y seguridad de API (2026)

Material didactico **independiente** creado para reforzar el temario de
[Programacion de Sistemas Web](https://github.com/DarkTortilla/web-systems-programming-students).

## Instalacion (Node 24 LTS)

```bash
npm install
cp .env.example .env
# Editar .env y poner un secreto propio (no publicarlo).
# macOS/Linux:
npm run dev
```

`npm run dev` carga `.env` mediante la opcion `--env-file` de Node.js.
No subir `.env` al repositorio.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
# Editar .env y definir un secreto privado.
npm run dev
```

## Pruebas

```bash
npm test
npm run test:watch
npm run test:coverage
npm run build
```

## Peticiones manuales

```bash
curl http://localhost:3000/api/salud
curl http://localhost:3000/api/tickets
```

Para generar un token de DEMOSTRACION en entorno local:

```bash
npm run token:demo -- profesor
# Copiar el token de salida; reemplazar TOKEN en el siguiente comando.
curl -X POST http://localhost:3000/api/tickets \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{"titulo":"Error al iniciar sesion"}'
```

Solo se usa memoria: al reiniciar se pierden los tickets. Una prueba de
integracion con memoria verifica **la integracion de HTTP y capas**, NO una BD
SQL real. Para cubrir SQL, implementar un adaptador MySQL de pruebas aislado.

## Guia

Consultar `Guia_Master_Class_Web_2026.tex` y PDF (si esta disponible) para
secuencia, actividades, dibujos, explicaciones y documentacion oficial.

## Sugerencia al primer commit

Ejecutar `npm install` (crea `package-lock.json`), agregar el lockfile a Git y
reemplazar el paso `npm install` del workflow por `npm ci`. `npm ci` requiere
un lockfile presente y consistente.

Para una petición simple desde PowerShell:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/salud
```

El ejemplo `curl` de Bash puede requerir ajustes de comillas en PowerShell;
para peticiones complejas se puede utilizar `Invoke-RestMethod` o `curl.exe`.
