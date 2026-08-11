package com.aquasella.horarios.dto;

import java.time.LocalDate;

/**
 * Forma que tiene un "día" cuando se serializa a JSON en la API.
 *
 * Ojo: si devolviéramos directamente el enum DiaFestival, Jackson lo
 * serializaría por defecto como un simple string ("JUEVES"), perdiendo
 * la etiqueta legible y la fecha. Este DTO evita ese problema sin tener
 * que tocar cómo se serializa DiaFestival en el resto de la API (por
 * ejemplo, dentro de Sesion.dia sí nos interesa que siga siendo un
 * string simple).
 */
public record DiaDTO(String id, String etiqueta, LocalDate fecha) {
}
