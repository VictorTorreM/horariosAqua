package com.aquasella.horarios.model;

import java.time.LocalDate;

/**
 * Representa el "día festivalero" tal como lo entiende el usuario
 * (Jueves, Viernes, Sábado, Domingo), independientemente de que
 * las actuaciones de esa sesión se extiendan de madrugada hacia
 * el día natural siguiente.
 */
public enum DiaFestival {

    JUEVES("Jueves 13", LocalDate.of(2026, 8, 13)),
    VIERNES("Viernes 14", LocalDate.of(2026, 8, 14)),
    SABADO("Sábado 15", LocalDate.of(2026, 8, 15)),
    DOMINGO("Domingo 16", LocalDate.of(2026, 8, 16));

    private final String etiqueta;
    private final LocalDate fecha;

    DiaFestival(String etiqueta, LocalDate fecha) {
        this.etiqueta = etiqueta;
        this.fecha = fecha;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public LocalDate getFecha() {
        return fecha;
    }
}
