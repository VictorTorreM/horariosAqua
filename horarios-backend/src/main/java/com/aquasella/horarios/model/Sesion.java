package com.aquasella.horarios.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Agrupa todas las actuaciones de UN escenario en UN día festivalero.
 * Ejemplo: "Bosque, Jueves" es una Sesion con 7 actuaciones dentro.
 */
public record Sesion(
        String id,
        DiaFestival dia,
        Escenario escenario,
        String escenarioLabel,
        LocalDateTime apertura,
        LocalDateTime cierre,
        List<Actuacion> actuaciones
) {
}
