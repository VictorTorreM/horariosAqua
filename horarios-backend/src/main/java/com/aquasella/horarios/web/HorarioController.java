package com.aquasella.horarios.web;

import com.aquasella.horarios.dto.DiaDTO;
import com.aquasella.horarios.model.DiaFestival;
import com.aquasella.horarios.model.Sesion;
import com.aquasella.horarios.service.HorarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

/**
 * Expone el horario del festival como API REST.
 *
 * Endpoints disponibles:
 *   GET /api/dias                -> lista de días del festival
 *   GET /api/sesiones            -> todas las sesiones (todos los días/escenarios)
 *   GET /api/sesiones?dia=JUEVES -> solo las sesiones de ese día
 *
 * De momento son de solo lectura (GET); no hay POST/PUT/DELETE porque
 * el usuario final nunca modifica el cartel, solo lo consulta.
 */
@RestController
@RequestMapping("/api")
public class HorarioController {

    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @GetMapping("/dias")
    public List<DiaDTO> listarDias() {
        return Arrays.stream(DiaFestival.values())
                .map(dia -> new DiaDTO(dia.name(), dia.getEtiqueta(), dia.getFecha()))
                .toList();
    }

    @GetMapping("/sesiones")
    public List<Sesion> listarSesiones(@RequestParam(required = false) DiaFestival dia) {
        if (dia != null) {
            return horarioService.obtenerSesionesPorDia(dia);
        }
        return horarioService.obtenerTodasLasSesiones();
    }
}
