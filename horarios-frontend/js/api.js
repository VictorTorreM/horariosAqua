// En local (sirviendo el frontend con `python3 -m http.server` o Live
// Server), el hostname es "localhost" o "127.0.0.1" y usamos el backend
// que corres tú mismo con `mvn spring-boot:run`. Cuando el sitio esté
// desplegado en Netlify, el hostname ya no será ninguno de esos dos, así
// que usamos la URL pública del backend en Render.
//
// TODO: sustituye esta URL por la que te dé Render al desplegar el backend.
const BACKEND_PRODUCCION = "https://horariosaqua.onrender.com/api";

const esLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
const API_BASE = esLocal ? "http://localhost:8080/api" : BACKEND_PRODUCCION;

export async function obtenerDias() {
  const respuesta = await fetch(`${API_BASE}/dias`);
  if (!respuesta.ok) {
    throw new Error("No se pudieron cargar los días del festival");
  }
  return respuesta.json();
}

export async function obtenerSesiones() {
  const respuesta = await fetch(`${API_BASE}/sesiones`);
  if (!respuesta.ok) {
    throw new Error("No se pudieron cargar los horarios");
  }
  return respuesta.json();
}
