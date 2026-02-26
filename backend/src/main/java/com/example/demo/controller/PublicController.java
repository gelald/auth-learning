package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "message", "Backend API is running");
    }

    @GetMapping("/info")
    public Map<String, String> info() {
        return Map.of(
                "app", "OIDC Demo Backend",
                "version", "1.0.0",
                "description", "SpringBoot backend with Keycloak authentication"
        );
    }
}
