# Music Therapy Tools - ejecución local con Cloudflare Tunnel

Esta app puede publicarse por Cloudflare Tunnel exponiendo solo `localhost:3000`.

Flujo esperado:

```text
Internet / Cloudflare Tunnel
↓
localhost:3000  (Node / Express / frontend)
↓
127.0.0.1:5000  (analisis_api.py / Python)
```

## Cómo levantarla

### Ventana 1 - Python

```powershell
cd "C:\Users\caro1\OneDrive\Escritorio\musicoterapia-app\tesis 9"
.\.venv\Scripts\python.exe .\analisis_api.py
```

### Ventana 2 - Node

```powershell
cd "C:\Users\caro1\OneDrive\Escritorio\musicoterapia-app\tesis 9"
npm start
```

Si querés definir una clave de sesión propia para el piloto:

```powershell
$env:SESSION_SECRET="cambia-esto-por-una-clave-larga"
npm start
```

Si necesitás apuntar Node a otra URL de Python:

```powershell
$env:PYTHON_API_URL="http://127.0.0.1:5000"
npm start
```

### Ventana 3 - Cloudflare Tunnel

```powershell
cd C:\cloudflared
.\cloudflared.exe tunnel --protocol http2 --url http://localhost:3000
```

## Qué probar primero

### Pruebas locales

1. Salud del backend Python:

```text
http://localhost:5000/health
```

Debe devolver:

```json
{"status":"ok","backend":"python"}
```

2. Salud del proxy Node -> Python:

```text
http://localhost:3000/api/test-python
```

Debe devolver algo como:

```json
{
  "ok": true,
  "pythonApiUrl": "http://127.0.0.1:5000",
  "pythonResponse": {
    "status": "ok",
    "backend": "python"
  }
}
```

### Prueba por Cloudflare Tunnel

Reemplazá `URL-DE-CLOUDFLARE` por la URL pública actual:

```text
https://URL-DE-CLOUDFLARE.trycloudflare.com/api/test-python
```

Si esto responde bien, el frontend público ya puede entrar al backend Python a través de Node.

## Endpoints importantes

- `GET /health`
  Salud del servidor Node.

- `GET /api/test-python`
  Verifica que Node pueda contactar al backend Python en `PYTHON_API_URL`.

- `POST /api/pacientes/:index/analizar/:pista`
  Endpoint principal de análisis desde el frontend.
  Este endpoint:
  1. recibe la solicitud desde el navegador
  2. localiza el video y el audio del metrónomo
  3. llama internamente a `PYTHON_API_URL + /analizar`
  4. devuelve el resultado normalizado al frontend

- `GET /api/me`
  Devuelve quién está autenticado en la sesión actual.

- `POST /login`
  Procesa e-mail + contraseña y abre sesión.

- `POST /logout`
  Cierra la sesión actual.

## Usuarios para el piloto

Los usuarios se guardan en:

```text
users.json
```

Cada usuario tiene:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`

### Crear un usuario

```powershell
cd "C:\Users\caro1\OneDrive\Escritorio\musicoterapia-app\tesis 9"
node create-user.js
```

El script pide:

- nombre
- e-mail
- contraseña
- rol (`admin` o `musicoterapeuta`)

## Aislamiento por usuario

Los datos privados ahora se separan por carpeta:

```text
users/
  USER_ID/
    pacientes.json
    videos/
    consentimientos/
    analysis_outputs/
```

Cada musicoterapeuta autenticado solo puede leer y escribir dentro de su propia carpeta.

## Pruebas manuales recomendadas

1. Crear un usuario `admin`.
2. Crear un usuario `musicoterapeuta`.
3. Entrar en:

```text
http://localhost:3000/login
```

4. Iniciar sesión con el primer usuario.
5. Crear un paciente.
6. Subir un video o consentimiento.
7. Ejecutar un análisis si corresponde.
8. Cerrar sesión.
9. Iniciar sesión con el segundo usuario.
10. Verificar que el segundo usuario no vea pacientes, videos, análisis ni resultados del primero.
11. Repetir la misma prueba desde:

```text
https://app.musictherapytools.com
```

## Nota

El frontend no debería llamar directamente a `localhost:5000` ni a `127.0.0.1:5000`.
Las solicitudes del navegador deben ir a `/api/...` y dejar que `server.js` actúe como intermediario.
