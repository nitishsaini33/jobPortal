package com.smarthire.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dob;
    private String profileSummary;
    private String resumeUrl;
    private String skills;
    private String education;
    private String experience;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
}
