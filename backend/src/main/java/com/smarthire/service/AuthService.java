package com.smarthire.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smarthire.config.JwtTokenProvider;
import com.smarthire.dto.auth.AuthResponse;
import com.smarthire.dto.auth.GoogleLoginRequest;
import com.smarthire.dto.auth.LoginRequest;
import com.smarthire.dto.auth.RegisterRequest;
import com.smarthire.entity.Role;
import com.smarthire.entity.User;
import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.RoleRepository;
import com.smarthire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service handling user registration and authentication.
 * 
 * Registration flow:
 *   1. Check for duplicate email
 *   2. Validate and fetch the requested role
 *   3. Encode password with BCrypt
 *   4. Save user with assigned role
 *   5. Authenticate and return JWT token
 * 
 * Login flow:
 *   1. Authenticate credentials via AuthenticationManager
 *   2. Generate and return JWT token
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String GOOGLE_CLIENT_ID = "705750863725-bns3l0a62b4cp2qi208q04bcuq3cqntf.apps.googleusercontent.com";

    /**
     * Authenticates via Google ID Token.
     */
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Check if user exists
                User user = userRepository.findByEmail(email).orElse(null);

                if (user == null) {
                    // This is a new user
                    if (request.getRole() == null || request.getRole().isEmpty()) {
                        throw new BadRequestException("ROLE_REQUIRED"); // Special error code for frontend
                    }
                    
                    String roleName = request.getRole().toUpperCase();
                    if (!roleName.equals("RECRUITER") && !roleName.equals("APPLICANT")) {
                        throw new BadRequestException("Invalid role. Must be RECRUITER or APPLICANT");
                    }
                    
                    Role role = roleRepository.findByName(roleName)
                            .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));

                    user = User.builder()
                            .fullName(name)
                            .email(email)
                            // Generate a random impossible password for Google-only users
                            .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                            .roles(Set.of(role))
                            .build();
                    user = userRepository.save(user);
                }

                List<org.springframework.security.core.GrantedAuthority> authorities = user.getRoles().stream()
                        .map(r -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + r.getName()))
                        .collect(Collectors.toList());

                Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                String token = jwtTokenProvider.generateToken(authentication);

                List<String> roles = user.getRoles().stream()
                        .map(Role::getName)
                        .toList();

                return AuthResponse.builder()
                        .accessToken(token)
                        .userId(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .roles(roles)
                        .build();
            } else {
                throw new BadRequestException("Invalid Google ID token.");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify Google token: " + e.getMessage());
        }
    }

    /**
     * Registers a new user and returns a JWT token.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        // Validate and fetch role
        String roleName = request.getRole().toUpperCase();
        if (!roleName.equals("RECRUITER") && !roleName.equals("APPLICANT")) {
            throw new BadRequestException("Invalid role. Must be RECRUITER or APPLICANT");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));

        // Create and save user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(role))
                .build();

        user = userRepository.save(user);

        // Authenticate and generate token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(List.of(roleName))
                .build();
    }

    /**
     * Authenticates a user and returns a JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
}
