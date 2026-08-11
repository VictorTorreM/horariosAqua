# horarios-backend

API REST con los horarios del festival Aquasella 2026. Sirve datos de solo
lectura (sin base de datos): el cartel se carga desde
`src/main/resources/data/horarios.json` al arrancar y se mantiene en memoria.

## Requisitos

- JDK 17 o superior instalado (`java -version` para comprobarlo)
- Maven instalado (`mvn -version`), o usa el wrapper si lo generas con
  `mvn wrapper:wrapper`

## Cómo arrancarlo en local

```bash
cd horarios-backend
mvn spring-boot:run
```

La primera vez tardará un poco en descargar las dependencias. Cuando veas
en la consola algo como `Started HorariosBackendApplication`, la API está
lista en `http://localhost:8080`.

## Endpoints para probar

Abre estas URLs directamente en el navegador (son GET):

- http://localhost:8080/api/dias
- http://localhost:8080/api/sesiones
- http://localhost:8080/api/sesiones?dia=JUEVES

## Estructura del proyecto

```
Dockerfile                            # imagen para desplegar en Render
src/main/java/com/aquasella/horarios/
├── HorariosBackendApplication.java   # clase main, arranca Spring Boot
├── config/WebConfig.java             # CORS: qué orígenes pueden llamar a la API
├── dto/DiaDTO.java                   # forma de un "día" en /api/dias
├── model/                            # las "formas" de los datos (records/enums)
│   ├── DiaFestival.java
│   ├── Escenario.java
│   ├── Sesion.java
│   └── Actuacion.java
├── service/HorarioService.java       # carga el JSON en memoria y lo consulta
└── web/HorarioController.java        # expone los endpoints REST

src/main/resources/
├── application.properties
└── data/horarios.json                # el cartel del festival (dataset completo)
```

## Estado actual

`data/horarios.json` contiene ya el cartel completo: **10 sesiones y 88
actuaciones** repartidas en los 4 días (Jueves 21, Viernes 27, Sábado 33,
Domingo 7). El frontend (repo/carpeta `horarios-frontend`) ya lo consume.

## Despliegue en Render (gratis)

Render no tiene un "runtime" nativo para Java: se despliega como imagen
Docker, usando el `Dockerfile` incluido en este proyecto.

1. Sube este proyecto a un repositorio de GitHub.
2. En [render.com](https://render.com) → **New +** → **Web Service**.
3. Conecta tu repositorio de GitHub.
4. Si backend y frontend viven en el mismo repo, en **Root Directory**
   pon la carpeta de este backend (ej. `horarios-backend`).
5. Render detecta el `Dockerfile` automáticamente — deja **Build Command**
   y **Start Command** vacíos (Docker ya se encarga).
6. **Instance Type**: Free.
7. Deploy. La primera build tarda unos minutos (descarga Maven + JDK).

Al terminar, Render te da una URL pública como
`https://horarios-backend-xxxx.onrender.com`. Guárdala: la necesitas para
configurar el frontend (`js/api.js`).

**Importante — plan gratuito de Render**: el servicio "duerme" tras ~15
minutos sin tráfico, y la primera petición después de dormir tarda
30–60 segundos en responder (arranque en frío). Para un caso de uso como
este (consultas puntuales durante el festival) es perfectamente asumible.

No olvides, cuando tengas la URL del frontend en Netlify, añadirla a
`allowedOrigins` en `WebConfig.java` y volver a hacer `git push` (Render
redespliega solo).
