import { estado, ESCENARIOS, actuacionesDelDia } from "./estado.js";

const elTabsDias = document.getElementById("tabs-dias");
const elChipsEscenarios = document.getElementById("chips-escenarios");
const elContenido = document.getElementById("contenido");
const elContadorFavoritos = document.getElementById("contador-favoritos");
const plantillaFila = document.getElementById("plantilla-fila-actuacion");

function formatearHora(iso) {
  // Los ISO vienen como "2026-08-13T21:00:00": nos basta con recortar,
  // no hace falta pasar por Date (y así evitamos líos de zona horaria
  // para algo tan simple como mostrar "21:00").
  return iso.slice(11, 16);
}

function estaSucediendoAhora(actuacion) {
  const ahora = new Date();
  return new Date(actuacion.inicio) <= ahora && ahora < new Date(actuacion.fin);
}

/* ============================================================
   VISTA "CUADRÍCULA" — timetable clásico de festival:
   horas en el eje horizontal, escenarios como filas.
   ============================================================ */
const PX_POR_MINUTO = 3; // 1 hora = 180px de ancho
const ANCHO_COL_ESCENARIO = 88; // debe coincidir con --ancho-col-escenario en styles.css
const ORDEN_ESCENARIOS = ["CARPA_LA_REAL", "OPEN_AIR", "BOSQUE", "AFTER_PARTY"];

/**
 * El eje de tiempo de la cuadrícula abarca desde la apertura más
 * temprana hasta el cierre más tardío entre TODOS los escenarios del
 * día (no cada sesión tiene por qué abrir/cerrar a la misma hora:
 * el viernes, por ejemplo, la Carpa abre a las 19:00 y el Bosque a
 * las 21:00). El final se redondea a la hora en punto siguiente para
 * que la última marca de la regla quede completa.
 */
function calcularEjeTemporal(sesionesDelDia) {
  const ejeInicio = new Date(Math.min(...sesionesDelDia.map((s) => new Date(s.apertura))));
  const finReal = new Date(Math.max(...sesionesDelDia.map((s) => new Date(s.cierre))));

  const ejeFin = new Date(finReal);
  if (ejeFin.getMinutes() !== 0) {
    ejeFin.setMinutes(0, 0, 0);
    ejeFin.setHours(ejeFin.getHours() + 1);
  }
  return { ejeInicio, ejeFin };
}

function minutosDesde(ejeInicio, iso) {
  return (new Date(iso) - ejeInicio) / 60000;
}

export function renderVistaCuadricula() {
  elContenido.innerHTML = "";

  const sesionesDelDia = estado.sesiones
    .filter((s) => s.dia === estado.diaSeleccionado)
    .sort((a, b) => ORDEN_ESCENARIOS.indexOf(a.escenario) - ORDEN_ESCENARIOS.indexOf(b.escenario));

  if (sesionesDelDia.length === 0) {
    elContenido.innerHTML = `<p class="estado-vacio">No hay sesiones para este día.</p>`;
    return;
  }

  const { ejeInicio, ejeFin } = calcularEjeTemporal(sesionesDelDia);
  const anchoPista = minutosDesde(ejeInicio, ejeFin) * PX_POR_MINUTO;

  const contenedor = document.createElement("div");
  contenedor.className = "grid-contenedor";

  const interior = document.createElement("div");
  interior.className = "grid-interior";
  interior.style.width = `${ANCHO_COL_ESCENARIO + anchoPista}px`;

  interior.appendChild(crearFilaHoras(ejeInicio, ejeFin));
  for (const sesion of sesionesDelDia) {
    interior.appendChild(crearFilaEscenario(sesion, ejeInicio));
  }

  const linea = crearLineaAhora(ejeInicio, ejeFin);
  if (linea) interior.appendChild(linea);

  contenedor.appendChild(interior);
  elContenido.appendChild(contenedor);
}

function crearFilaHoras(ejeInicio, ejeFin) {
  const fila = document.createElement("div");
  fila.className = "fila-grid fila-grid--horas";

  const esquina = document.createElement("div");
  esquina.className = "fila-grid__escenario fila-grid__escenario--esquina";
  fila.appendChild(esquina);

  const pista = document.createElement("div");
  pista.className = "fila-grid__pista fila-grid__pista--horas";

  for (let marca = new Date(ejeInicio); marca <= ejeFin; marca.setHours(marca.getHours() + 1)) {
    const etiqueta = document.createElement("span");
    etiqueta.className = "marca-hora";
    etiqueta.style.left = `${minutosDesde(ejeInicio, marca) * PX_POR_MINUTO}px`;
    etiqueta.textContent = marca.toTimeString().slice(0, 5);
    pista.appendChild(etiqueta);
  }

  fila.appendChild(pista);
  return fila;
}

function crearFilaEscenario(sesion, ejeInicio) {
  const info = ESCENARIOS[sesion.escenario];

  const fila = document.createElement("div");
  fila.className = "fila-grid";

  const celda = document.createElement("div");
  celda.className = "fila-grid__escenario";
  celda.style.setProperty("--chip-color", `var(${info.colorVar})`);

  const punto = document.createElement("span");
  punto.className = "fila-grid__punto";
  celda.appendChild(punto);
  celda.appendChild(document.createTextNode(info.nombre));

  if (sesion.escenarioLabel) {
    const small = document.createElement("small");
    small.textContent = sesion.escenarioLabel;
    celda.appendChild(small);
  }
  fila.appendChild(celda);

  const pista = document.createElement("div");
  pista.className = "fila-grid__pista";
  for (const actuacion of sesion.actuaciones) {
    pista.appendChild(crearBloqueActuacion(actuacion, ejeInicio));
  }
  fila.appendChild(pista);

  return fila;
}

function crearBloqueActuacion(actuacion, ejeInicio) {
  const inicioMin = minutosDesde(ejeInicio, actuacion.inicio);
  const duracionMin = minutosDesde(ejeInicio, actuacion.fin) - inicioMin;

  const bloque = document.createElement("button");
  bloque.type = "button";
  bloque.className = "bloque-actuacion";
  bloque.style.left = `${inicioMin * PX_POR_MINUTO}px`;
  bloque.style.width = `${Math.max(duracionMin * PX_POR_MINUTO - 2, 20)}px`;
  bloque.dataset.id = actuacion.id;
  bloque.setAttribute("aria-pressed", String(estado.favoritos.has(actuacion.id)));
  if (estaSucediendoAhora(actuacion)) bloque.classList.add("es-ahora");

  const nombre = document.createElement("span");
  nombre.className = "bloque-actuacion__nombre";
  nombre.textContent = actuacion.artista;
  bloque.appendChild(nombre);

  const corazon = document.createElement("span");
  corazon.className = "bloque-actuacion__corazon";
  corazon.textContent = "♥";
  corazon.setAttribute("aria-hidden", "true");
  bloque.appendChild(corazon);

  return bloque;
}

function crearLineaAhora(ejeInicio, ejeFin) {
  const ahora = new Date();
  if (ahora < ejeInicio || ahora > ejeFin) return null;

  const linea = document.createElement("div");
  linea.className = "linea-ahora";
  linea.style.left = `${ANCHO_COL_ESCENARIO + minutosDesde(ejeInicio, ahora) * PX_POR_MINUTO}px`;
  return linea;
}

/**
 * Mueve la línea de "ahora" sin reconstruir toda la cuadrícula.
 * Se llama cada pocos segundos; combinada con la transición CSS de
 * `.linea-ahora`, produce un movimiento continuo de izquierda a
 * derecha en vez de saltos bruscos. El "resync" exacto (por si hay
 * que crearla o quitarla al entrar/salir del rango del día) lo sigue
 * haciendo el re-render completo cada minuto.
 */
export function actualizarLineaAhora() {
  const linea = elContenido.querySelector(".linea-ahora");
  if (!linea) return;

  const sesionesDelDia = estado.sesiones.filter((s) => s.dia === estado.diaSeleccionado);
  if (sesionesDelDia.length === 0) return;

  const { ejeInicio } = calcularEjeTemporal(sesionesDelDia);
  linea.style.left = `${ANCHO_COL_ESCENARIO + minutosDesde(ejeInicio, new Date()) * PX_POR_MINUTO}px`;
}

/** Actualiza solo el estado visual de un bloque, sin re-renderizar toda la cuadrícula. */
export function actualizarBloqueFavorito(idActuacion) {
  const bloque = elContenido.querySelector(`.bloque-actuacion[data-id="${idActuacion}"]`);
  if (bloque) {
    bloque.setAttribute("aria-pressed", String(estado.favoritos.has(idActuacion)));
  }
}

/* ============================================================
   TABS DE DÍA
   ============================================================ */
export function renderTabsDias() {
  elTabsDias.innerHTML = "";
  for (const dia of estado.dias) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "tab-dia";
    boton.textContent = dia.etiqueta;
    boton.dataset.dia = dia.id;
    boton.setAttribute("role", "tab");
    boton.setAttribute("aria-selected", String(dia.id === estado.diaSeleccionado));
    if (dia.id === estado.diaSeleccionado) boton.classList.add("is-activo");
    elTabsDias.appendChild(boton);
  }
}

/* ============================================================
   CHIPS DE ESCENARIO (solo los que tienen sesión ese día)
   ============================================================ */
export function renderChipsEscenarios() {
  elChipsEscenarios.innerHTML = "";

  const sesionesDelDia = estado.sesiones.filter((s) => s.dia === estado.diaSeleccionado);
  const escenariosDelDia = [...new Set(sesionesDelDia.map((s) => s.escenario))];

  const chipTodos = crearChipEscenario("TODOS", "Todos", null);
  elChipsEscenarios.appendChild(chipTodos);

  for (const idEscenario of escenariosDelDia) {
    const sesion = sesionesDelDia.find((s) => s.escenario === idEscenario);
    const info = ESCENARIOS[idEscenario];
    const etiqueta = sesion.escenarioLabel
      ? `${info.nombre} · ${sesion.escenarioLabel}`
      : info.nombre;
    elChipsEscenarios.appendChild(crearChipEscenario(idEscenario, etiqueta, info.colorVar));
  }
}

function crearChipEscenario(id, etiqueta, colorVar) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chip-escenario";
  chip.dataset.escenario = id;
  if (colorVar) {
    chip.style.setProperty("--chip-color", `var(${colorVar})`);
    const punto = document.createElement("span");
    punto.className = "chip-escenario__punto";
    chip.appendChild(punto);
  }
  chip.appendChild(document.createTextNode(etiqueta));
  if (id === estado.escenarioSeleccionado) chip.classList.add("is-activo");
  return chip;
}

/* ============================================================
   VISTA "HORARIO"
   ============================================================ */
export function renderVistaHorario() {
  elContenido.innerHTML = "";

  let actuaciones = actuacionesDelDia(estado.diaSeleccionado);
  if (estado.escenarioSeleccionado !== "TODOS") {
    actuaciones = actuaciones.filter((a) => a.sesion.escenario === estado.escenarioSeleccionado);
  }

  if (actuaciones.length === 0) {
    elContenido.innerHTML = `<p class="estado-vacio">No hay actuaciones para este filtro.</p>`;
    return;
  }

  const lista = document.createElement("ul");
  lista.className = "lista-actuaciones";
  for (const actuacion of actuaciones) {
    lista.appendChild(crearFilaActuacion(actuacion));
  }
  elContenido.appendChild(lista);
}

function crearFilaActuacion(actuacion) {
  const fila = plantillaFila.content.firstElementChild.cloneNode(true);
  fila.id = `actuacion-${actuacion.id}`;
  fila.dataset.id = actuacion.id;

  const info = ESCENARIOS[actuacion.sesion.escenario];

  fila.querySelector(".fila-actuacion__hora").textContent = formatearHora(actuacion.inicio);
  fila.querySelector(".fila-actuacion__nombre").textContent = actuacion.artista;

  const elLive = fila.querySelector(".etiqueta-live");
  if (actuacion.live) elLive.hidden = false;

  const meta = fila.querySelector(".fila-actuacion__meta");
  meta.style.setProperty("--chip-color", `var(${info.colorVar})`);
  const puntoEscenario = document.createElement("span");
  puntoEscenario.className = "punto-escenario";
  meta.appendChild(puntoEscenario);

  const textoMeta = actuacion.sesion.escenarioLabel
    ? `${info.nombre} · ${actuacion.sesion.escenarioLabel}`
    : info.nombre;
  meta.appendChild(document.createTextNode(textoMeta));

  if (actuacion.nota) {
    meta.appendChild(document.createTextNode(` · ${actuacion.nota}`));
  }

  if (estaSucediendoAhora(actuacion)) {
    fila.classList.add("es-ahora");
    const etiquetaAhora = document.createElement("span");
    etiquetaAhora.className = "etiqueta-ahora";
    etiquetaAhora.textContent = "AHORA";
    fila.querySelector(".fila-actuacion__artista").appendChild(etiquetaAhora);
  }

  const botonFav = fila.querySelector(".boton-favorito");
  const esFav = estado.favoritos.has(actuacion.id);
  botonFav.setAttribute("aria-pressed", String(esFav));
  botonFav.dataset.id = actuacion.id;

  return fila;
}

/** Actualiza solo el corazón de una fila concreta, sin re-renderizar todo. */
export function actualizarBotonFavorito(idActuacion) {
  const boton = elContenido.querySelector(`.boton-favorito[data-id="${idActuacion}"]`);
  if (boton) {
    boton.setAttribute("aria-pressed", String(estado.favoritos.has(idActuacion)));
  }
}

/* ============================================================
   VISTA "FAVORITOS"
   ============================================================ */
export function renderVistaFavoritos() {
  elContenido.innerHTML = "";

  if (estado.favoritos.size === 0) {
    elContenido.innerHTML = `
      <p class="estado-vacio">
        Aún no has marcado nada.<br />
        Vuelve al horario y toca el corazón de lo que no te quieras perder.
      </p>`;
    return;
  }

  for (const dia of estado.dias) {
    const favoritosDelDia = actuacionesDelDia(dia.id).filter((a) => estado.favoritos.has(a.id));
    if (favoritosDelDia.length === 0) continue;

    const grupo = document.createElement("section");
    grupo.className = "grupo-favoritos";

    const titulo = document.createElement("h2");
    titulo.className = "grupo-favoritos__titulo";
    titulo.textContent = dia.etiqueta;
    grupo.appendChild(titulo);

    let escenarioActual = null;
    for (const actuacion of favoritosDelDia) {
      if (actuacion.sesion.escenario !== escenarioActual) {
        escenarioActual = actuacion.sesion.escenario;
        const info = ESCENARIOS[escenarioActual];
        const subtitulo = document.createElement("p");
        subtitulo.className = "grupo-favoritos__escenario";
        subtitulo.textContent = actuacion.sesion.escenarioLabel
          ? `${info.nombre} · ${actuacion.sesion.escenarioLabel}`
          : info.nombre;
        grupo.appendChild(subtitulo);
      }
      grupo.appendChild(crearFilaFavorito(actuacion));
    }

    elContenido.appendChild(grupo);
  }
}

function crearFilaFavorito(actuacion) {
  const fila = document.createElement("div");
  fila.className = "fila-favorito";

  // Dos botones hermanos (no uno anidado dentro de otro, que no es
  // válido en HTML): uno para navegar al horario, otro para quitar
  // el favorito. Así cada uno mantiene su semántica de botón real
  // (foco de teclado, lector de pantalla) sin trucos de CSS.
  const irButton = document.createElement("button");
  irButton.type = "button";
  irButton.className = "fila-favorito__ir";
  irButton.dataset.irADia = actuacion.sesion.dia;
  irButton.dataset.irAActuacion = actuacion.id;

  const hora = document.createElement("span");
  hora.className = "fila-favorito__hora";
  hora.textContent = formatearHora(actuacion.inicio);

  const nombre = document.createElement("span");
  nombre.className = "fila-favorito__artista";
  nombre.textContent = actuacion.artista;

  irButton.append(hora, nombre);

  const quitar = document.createElement("button");
  quitar.type = "button";
  quitar.className = "fila-favorito__quitar";
  quitar.dataset.quitarFavorito = actuacion.id;
  quitar.textContent = "Quitar";

  fila.append(irButton, quitar);
  return fila;
}

/* ============================================================
   CONTADOR DE FAVORITOS EN LA CABECERA
   ============================================================ */
export function renderContadorFavoritos() {
  const total = estado.favoritos.size;
  elContadorFavoritos.hidden = total === 0;
  elContadorFavoritos.textContent = String(total);
}
