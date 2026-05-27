package com.smarthire.controller;

import com.smarthire.dto.auth.AuthResponse;
import com.smarthire.dto.auth.LoginRequest;
import com.smarthire.dto.auth.RegisterRequest;
import com.smarthire.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * 
 * POST /api/auth/register — Register a new user (returns JWT token)
 * POST /api/auth/login    — Authenticate a user (returns JWT token)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registers a new user account.
     * 
     * @param request contains fullName, email, password, phone (optional), role
     * @return AuthResponse with JWT token and user details
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticates an existing user.
     * 
     * @param request contains email and password
     * @return AuthResponse with JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticates a user via Google ID Token.
     * 
     * @param request contains Google JWT credential and optional role
     * @return AuthResponse with JWT token and user details
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody com.smarthire.dto.auth.GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(response);
    }
}
