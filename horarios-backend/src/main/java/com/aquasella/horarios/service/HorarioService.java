package com.aquasella.horarios.service;

import com.aquasella.horarios.model.DiaFestival;
import com.aquasella.horarios.model.Sesion;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Fuente de verdad de los horarios del festival.
 *
 * No usamos base de datos: los datos del cartel no cambian con el uso
 * de la aplicación (nadie los edita desde la web), así que basta con
 * cargar una vez el fichero src/main/resources/data/horarios.json al
 * arrancar y mantenerlo en memoria durante toda la vida de la app.
 *
 * Si algún día quisiéramos editar el cartel sin volver a desplegar,
 * este sería el sitio natural para sustituir la carga desde JSON por
 * una consulta a una base de datos, sin tocar el controller.
 */
@Service
public class HorarioService {

    private List<Sesion> sesiones;

    @PostConstruct
    public void cargarDatos() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        try (InputStream input = new ClassPathResource("data/horarios.json").getInputStream()) {
            sesiones = mapper.readValue(
                    input,
                    mapper.getTypeFactory().constructCollectionType(List.class, Sesion.class)
            );
        }
    }

    public List<Sesion> obtenerTodasLasSesiones() {
        return sesiones;
    }

    public List<Sesion> obtenerSesionesPorDia(DiaFestival dia) {
        return sesiones.stream()
                .filter(sesion -> sesion.dia() == dia)
                .toList();
    }
}
