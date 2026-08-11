// Nombres legibles y color asociado a cada escenario físico.
// Los colores están definidos como variables CSS en styles.css;
// aquí solo guardamos el NOMBRE de esa variable para poder aplicarla
// dinámicamente con estilo inline (--chip-color).
export const ESCENARIOS = {
  CARPA_LA_REAL: { nombre: "Carpa La Real", colorVar: "--color-carpa" },
  OPEN_AIR: { nombre: "Open Air", colorVar: "--color-openair" },
  BOSQUE: { nombre: "Bosque", colorVar: "--color-bosque" },
  AFTER_PARTY: { nombre: "After Party", colorVar: "--color-after" },
};

// Estado en memoria de toda la aplicación. Al ser un único objeto
// mutable importado por varios módulos, todos comparten la misma
// "fuente de la verdad" sin necesidad de un framework de estado.
export const estado = {
  dias: [], // viene de GET /api/dias
  sesiones: [], // viene de GET /api/sesiones
  favoritos: new Set(),

  vista: "horario", // "horario" | "favoritos"
  diaSeleccionado: null, // "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO"
  escenarioSeleccionado: "TODOS", // "TODOS" | "CARPA_LA_REAL" | ...
};

/** Todas las actuaciones del día seleccionado, en una sola lista plana. */
export function actuacionesDelDia(dia) {
  const sesionesDelDia = estado.sesiones.filter((s) => s.dia === dia);
  const actuaciones = [];
  for (const sesion of sesionesDelDia) {
    for (const actuacion of sesion.actuaciones) {
      actuaciones.push({ ...actuacion, sesion });
    }
  }
  actuaciones.sort((a, b) => a.inicio.localeCompare(b.inicio));
  return actuaciones;
}

/** Busca una actuación por su ID en todas las sesiones cargadas. */
export function buscarActuacionPorId(id) {
  for (const sesion of estado.sesiones) {
    const actuacion = sesion.actuaciones.find((a) => a.id === id);
    if (actuacion) return { ...actuacion, sesion };
  }
  return null;
}
