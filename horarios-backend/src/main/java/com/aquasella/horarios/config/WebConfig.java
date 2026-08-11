package com.aquasella.horarios.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * El frontend (HTML/CSS/JS) y el backend (Spring Boot) se sirven desde
 * dominios/puertos distintos, así que el navegador bloquea las peticiones
 * fetch() por la política CORS a menos que el backend las autorice
 * explícitamente. Aquí abrimos /api/** a los orígenes desde los que
 * vamos a trabajar.
 *
 * Cuando despleguemos el frontend (Netlify/GitHub Pages), añadiremos
 * su URL definitiva a esta lista.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5500",
                        "http://127.0.0.1:5500",
                        "http://localhost:5173"
                        // TODO: cuando despliegues el frontend en Netlify, añade aquí
                        // su URL definitiva, ej. "https://aquasella-horarios.netlify.app"
                )
                .allowedMethods("GET");
    }
}
