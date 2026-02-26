package com.example.demo.controller;

import com.example.demo.properties.KeycloakProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/introspect")
@RequiredArgsConstructor
@Slf4j
public class IntrospectionController {
    private final KeycloakProperties keycloakProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<Map<String, Object>> introspectToken(Authentication authentication) {
        try {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String token = jwt.getTokenValue();

            String introspectionUrl = keycloakProperties.getServerUrl() + "/realms/" + keycloakProperties.getRealm() + "/protocol/openid-connect/token/introspect";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", "demo-backend");
            body.add("client_secret", keycloakProperties.getClientSecret());
            body.add("token", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(introspectionUrl, request, Map.class);

            log.info("Token introspection result: {}", response.getBody());

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Error during token introspection", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("active", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
