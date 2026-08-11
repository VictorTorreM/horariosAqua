# horarios-frontend

Frontend estático (HTML + CSS + JS, sin frameworks ni build tools) que
consume la API del backend Spring Boot y pinta el horario del festival.

## Por qué hace falta un servidor local (aunque sea estático)

El JS está organizado en módulos ES (`import`/`export`), y los navegadores
bloquean los módulos cuando abres el HTML directamente con doble clic
(protocolo `file://`). Hace falta servirlo por `http://`, aunque sea con
un servidor mínimo sin backend real detrás.

Dos formas igual de válidas, elige la que te resulte más cómoda:

**Opción A — Python (ya lo tienes si usas el backend):**
```bash
cd horarios-frontend
python3 -m http.server 5500
```
Abre `http://localhost:5500`.

**Opción B — Extensión "Live Server" de VS Code:**
Botón derecho sobre `index.html` → "Open with Live Server". Por defecto
también usa el puerto 5500.

Importante: usa el puerto **5500** (o cambia el origen permitido en
`WebConfig.java` del backend si usas otro). El backend solo acepta
peticiones CORS desde `localhost:5500`, `127.0.0.1:5500` y
`localhost:5173`.

## Cómo probarlo

1. Arranca primero el backend (`mvn spring-boot:run` en `horarios-backend`,
   puerto 8080).
2. Sirve este frontend como se explica arriba.
3. Deberías ver las pestañas de los 4 días y, dentro de cada una, la lista
   de actuaciones ordenada por hora, con filtros por escenario y un
   corazón para marcar favoritos.

## Estructura

```
index.html            # estructura de la página + plantilla de fila
css/styles.css         # todo el diseño visual
js/api.js              # llamadas fetch al backend
js/favoritos.js        # leer/escribir favoritos en localStorage
js/estado.js           # estado compartido en memoria + metadatos de escenarios
js/render.js           # construye el DOM a partir del estado
js/app.js              # arranque de la app y todos los listeners de eventos
```

## Cómo funciona (resumen)

- Al cargar, pide `/api/dias` y `/api/sesiones` una sola vez y lo guarda
  todo en memoria (`estado.js`). No hay más llamadas al backend después:
  cambiar de pestaña o de filtro es solo repintar con los datos que ya
  tenemos.
- Los favoritos son un `Set` de IDs de actuación (ej. `"sab-carpa-0200"`),
  reflejado en `localStorage` bajo la clave `aquasella-favoritos`.
- La fila cuya hora actual cae dentro de `inicio`–`fin` se marca con
  "AHORA" (se recalcula cada minuto). Como el JSON del backend ya trae
  fechas reales (agosto de 2026), esto solo se activará durante el
  festival de verdad.

## Despliegue en Netlify (gratis)

Al ser HTML/CSS/JS plano, no hay build: Netlify solo tiene que servir los
ficheros tal cual.

1. Sube este proyecto a GitHub (puede ser el mismo repo que el backend,
   en otra carpeta, o uno aparte — cualquiera de las dos formas vale).
2. En [netlify.com](https://netlify.com) → **Add new site** → **Import an
   existing project** → conecta el repositorio.
3. **Base directory**: la carpeta de este frontend (ej. `horarios-frontend`).
4. **Build command**: déjalo vacío.
5. **Publish directory**: `.` (el propio `netlify.toml` ya lo indica).
6. Deploy. Netlify te da una URL tipo `https://algo-random.netlify.app`
   (puedes cambiarle el nombre desde **Site settings**).

## Antes de que todo funcione en producción (dos pasos cruzados)

Backend y frontend necesitan saber la URL del otro, así que el orden
importa:

1. Despliega primero el **backend** en Render y copia su URL pública.
2. Edita `js/api.js`: sustituye `BACKEND_PRODUCCION` por esa URL.
   `git commit` + `git push` (Netlify redespliega solo si ya estaba conectado,
   o simplemente despliega ahora si es la primera vez).
3. Despliega el **frontend** en Netlify y copia su URL pública.
4. Edita `WebConfig.java` en el backend: añade esa URL a `allowedOrigins`.
   `git commit` + `git push` (Render redespliega solo).
5. Abre la URL de Netlify y comprueba que carga los horarios de verdad.
