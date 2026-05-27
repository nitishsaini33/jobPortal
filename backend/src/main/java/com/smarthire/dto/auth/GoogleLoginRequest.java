package com.smarthire.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request payload for Google Login containing the Google ID Token and an optional role selection.
 */
@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Google credential token is required")
    private String credential;
    
    // Only used for brand new users, indicating what role they want to sign up as.
    // E.g., "RECRUITER" or "APPLICANT"
    private String role;
}
