package com.aquasella.horarios.model;

import java.time.LocalDateTime;

/**
 * Una actuación/set concreto dentro de una sesión.
 * Usamos un "record" porque estos datos son de solo lectura: no se
 * modifican en tiempo de ejecución, solo se cargan una vez desde el
 * JSON y se sirven tal cual. Java genera automáticamente el
 * constructor, los getters (id(), artista()...), equals() y hashCode().
 *
 * inicio/fin ya vienen con la fecha real resuelta (por ejemplo, un set
 * de la 1:30 de la sesión del Jueves tiene fecha real 14 de agosto).
 */
public record Actuacion(
        String id,
        String artista,
        boolean live,
        String nota,
        LocalDateTime inicio,
        LocalDateTime fin
) {
}
