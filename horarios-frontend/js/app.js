import { obtenerDias, obtenerSesiones } from "./api.js";
import { cargarFavoritos, alternarFavorito } from "./favoritos.js";
import { estado, buscarActuacionPorId } from "./estado.js";
import {
  renderTabsDias,
  renderChipsEscenarios,
  renderVistaHorario,
  renderVistaCuadricula,
  renderVistaFavoritos,
  renderContadorFavoritos,
  actualizarBotonFavorito,
  actualizarBloqueFavorito,
} from "./render.js";

const elContenido = document.getElementById("contenido");
const elTabsDias = document.getElementById("tabs-dias");
const elChipsEscenarios = document.getElementById("chips-escenarios");
const elBotonesVista = document.querySelectorAll(".chip-vista");

function elegirDiaPorDefecto(dias) {
  const hoyISO = new Date().toISOString().slice(0, 10); // "2026-08-14"
  const diaDeHoy = dias.find((d) => d.fecha === hoyISO);
  return (diaDeHoy ?? dias[0]).id;
}

function renderVistaActual() {
  elChipsEscenarios.hidden = estado.vista !== "horario";
  if (estado.vista === "horario") {
    renderVistaHorario();
  } else if (estado.vista === "cuadricula") {
    renderVistaCuadricula();
  } else {
    renderVistaFavoritos();
  }
}

function renderTodo() {
  renderTabsDias();
  renderChipsEscenarios();
  renderVistaActual();
  renderContadorFavoritos();
}

/* ============================================================
   EVENTOS
   ============================================================ */

for (const boton of elBotonesVista) {
  boton.addEventListener("click", () => {
    estado.vista = boton.dataset.vista;
    for (const b of elBotonesVista) b.classList.toggle("is-activo", b === boton);
    renderVistaActual();
  });
}

elTabsDias.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".tab-dia");
  if (!boton) return;
  estado.diaSeleccionado = boton.dataset.dia;
  estado.escenarioSeleccionado = "TODOS";
  renderTabsDias();
  renderChipsEscenarios();
  renderVistaActual();
});

elChipsEscenarios.addEventListener("click", (evento) => {
  const chip = evento.target.closest(".chip-escenario");
  if (!chip) return;
  estado.escenarioSeleccionado = chip.dataset.escenario;
  renderChipsEscenarios();
  renderVistaHorario();
});

// Delegación de eventos sobre todo el contenido: cubre tanto la vista
// "horario" (botón de corazón) como la vista "favoritos" (ir / quitar),
// sin tener que enganchar un listener por cada fila.
elContenido.addEventListener("click", (evento) => {
  const botonFav = evento.target.closest(".boton-favorito, .bloque-actuacion");
  if (botonFav) {
    alternarFavoritoEnPantalla(botonFav.dataset.id);
    return;
  }

  const botonQuitar = evento.target.closest("[data-quitar-favorito]");
  if (botonQuitar) {
    alternarFavoritoEnPantalla(botonQuitar.dataset.quitarFavorito);
    return;
  }

  const irA = evento.target.closest("[data-ir-a-actuacion]");
  if (irA) {
    irAHorarioYResaltar(irA.dataset.irADia, irA.dataset.irAActuacion);
  }
});

function alternarFavoritoEnPantalla(idActuacion) {
  estado.favoritos = alternarFavorito(estado.favoritos, idActuacion);
  renderContadorFavoritos();
  if (estado.vista === "horario") {
    actualizarBotonFavorito(idActuacion);
  } else if (estado.vista === "cuadricula") {
    actualizarBloqueFavorito(idActuacion);
  } else {
    renderVistaFavoritos();
  }
}

function irAHorarioYResaltar(dia, idActuacion) {
  estado.vista = "horario";
  estado.diaSeleccionado = dia;
  estado.escenarioSeleccionado = "TODOS";
  for (const b of elBotonesVista) b.classList.toggle("is-activo", b.dataset.vista === "horario");
  renderTabsDias();
  renderChipsEscenarios();
  renderVistaActual();

  const fila = document.getElementById(`actuacion-${idActuacion}`);
  if (fila) {
    fila.scrollIntoView({ behavior: "smooth", block: "center" });
    fila.classList.add("resaltada");
    setTimeout(() => fila.classList.remove("resaltada"), 1600);
  }
}

// Refresca la marca "AHORA" (y la línea de la cuadrícula) cada minuto.
setInterval(() => {
  if (estado.vista === "horario" || estado.vista === "cuadricula") {
    renderVistaActual();
  }
}, 60_000);

/* ============================================================
   ARRANQUE
   ============================================================ */
async function iniciar() {
  try {
    const [dias, sesiones] = await Promise.all([obtenerDias(), obtenerSesiones()]);
    estado.dias = dias;
    estado.sesiones = sesiones;
    estado.favoritos = cargarFavoritos();
    estado.diaSeleccionado = elegirDiaPorDefecto(dias);
    renderTodo();
  } catch (error) {
    console.error(error);
    elContenido.innerHTML = `
      <p class="estado-error">
        No se ha podido conectar con el servidor de horarios.<br />
        Comprueba que el backend está arrancado en <code>localhost:8080</code>.
      </p>`;
  }
}

iniciar();
