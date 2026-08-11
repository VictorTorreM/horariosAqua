package com.aquasella.horarios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicación.
 * Al ejecutar este main(), Spring Boot arranca un servidor web embebido (Tomcat)
 * en el puerto configurado en application.properties (por defecto, 8080).
 */
@SpringBootApplication
public class HorariosBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HorariosBackendApplication.class, args);
    }
}
