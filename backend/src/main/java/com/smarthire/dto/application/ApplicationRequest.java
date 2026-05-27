package com.smarthire.dto.application;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for submitting a job application.
 * The resume file is sent separately as a multipart file attachment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {

    private Long jobId;

    @Size(max = 5000, message = "Cover letter must not exceed 5000 characters")
    private String coverLetter;

    @Size(max = 500, message = "Skills must not exceed 500 characters")
    private String skills;

    @Min(value = 0, message = "Experience years cannot be negative")
    private Integer experienceYears = 0;
}
