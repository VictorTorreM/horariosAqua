const CLAVE_STORAGE = "aquasella-favoritos";

/**
 * Lee los favoritos guardados en el navegador.
 * Devuelve un Set de IDs de actuación (ej. "sab-carpa-0200").
 * Si no hay nada guardado, o el dato está corrupto, devuelve un Set vacío
 * en vez de romper la aplicación.
 */
export function cargarFavoritos() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    return new Set(guardado ? JSON.parse(guardado) : []);
  } catch (error) {
    console.warn("No se pudieron leer los favoritos guardados:", error);
    return new Set();
  }
}

function guardarFavoritos(favoritos) {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify([...favoritos]));
  } catch (error) {
    // Por ejemplo, si el navegador está en modo privado y bloquea localStorage.
    console.warn("No se pudieron guardar los favoritos:", error);
  }
}

/**
 * Añade o quita un ID del conjunto de favoritos y lo persiste.
 * Devuelve el nuevo Set (no muta el original) para que el llamador
 * pueda decidir cuándo volver a renderizar.
 */
export function alternarFavorito(favoritosActuales, idActuacion) {
  const nuevo = new Set(favoritosActuales);
  if (nuevo.has(idActuacion)) {
    nuevo.delete(idActuacion);
  } else {
    nuevo.add(idActuacion);
  }
  guardarFavoritos(nuevo);
  return nuevo;
}
