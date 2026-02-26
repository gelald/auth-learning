package com.example.demo.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakProperties {
    private String serverUrl = "http://localhost:8080";
    private String realm = "demo-realm";
    private String clientId = "demo-backend";
    private String clientSecret = "";
}
