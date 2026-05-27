package com.smarthire.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response payload returned after successful login or registration.
 * Contains the JWT access token, user info, and assigned roles.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long userId;
    private String fullName;
    private String email;
    private List<String> roles;
}
