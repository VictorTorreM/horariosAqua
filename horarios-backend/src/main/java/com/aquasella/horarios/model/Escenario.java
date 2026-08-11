package com.aquasella.horarios.model;

/**
 * Escenarios físicos del recinto. Ojo: el Bosque cambia de nombre
 * comercial cada día (Mixmag Spain Stage / Rebels / Loop), pero es
 * siempre el mismo espacio. Ese nombre variable se guarda aparte,
 * en Sesion.escenarioLabel, no aquí.
 */
public enum Escenario {

    CARPA_LA_REAL("Carpa La Real"),
    OPEN_AIR("Open Air"),
    BOSQUE("Bosque"),
    AFTER_PARTY("After Party");

    private final String nombre;

    Escenario(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }
}
