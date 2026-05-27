package com.smarthire.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS configuration to allow the React frontend (running on localhost:5173)
 * to communicate with the Spring Boot backend (running on localhost:8080).
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",                          // Vite dev server
                "http://localhost:3000",                          // Fallback for CRA
                "https://job-portal-gray-omega.vercel.app",       // Old Vercel production
                "https://job-portal-n-seven.vercel.app"           // New Vercel production
        ));
        config.setAllowedOriginPatterns(List.of("https://*.vercel.app")); // Allow all vercel preview URLs
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // Apply to all paths including 404s
        return source;
    }
}
