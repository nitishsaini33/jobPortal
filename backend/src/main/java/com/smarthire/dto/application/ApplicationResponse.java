package com.smarthire.dto.application;

import com.smarthire.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response payload representing a job application.
 * Includes denormalized job and applicant info to avoid extra API calls.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {

    private Long id;

    // Job info
    private Long jobId;
    private String jobTitle;
    private String jobCompany;

    // Applicant info
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;

    // Application details
    private String resumePath;
    private boolean hasResume;
    private String coverLetter;
    private String skills;
    private Integer experienceYears;
    private ApplicationStatus status;
    private String recruiterNotes;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
