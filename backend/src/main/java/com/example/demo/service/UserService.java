package com.example.demo.service;

import com.example.demo.dto.UserDto;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToDto(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserByKeycloakId(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found with keycloakId: " + keycloakId));
        return mapToDto(user);
    }

    public UserDto getCurrentUser(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String keycloakId = jwt.getSubject();
        return getUserByKeycloakId(keycloakId);
    }

    public UserDto syncUserFromKeycloak(String keycloakId, String username, String email, 
                                         String firstName, String lastName, List<String> roles) {
        Optional<User> existingUser = userRepository.findByKeycloakId(keycloakId);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setUsername(username);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(roles.isEmpty() ? "user" : roles.get(0));
            return mapToDto(userRepository.save(user));
        } else {
            User newUser = new User();
            newUser.setKeycloakId(keycloakId);
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setRole(roles.isEmpty() ? "user" : roles.get(0));
            newUser.setActive(true);
            return mapToDto(userRepository.save(newUser));
        }
    }

    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setActive(userDto.getActive());
        
        return mapToDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }

    private UserDto mapToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getActive()
        );
    }
}
