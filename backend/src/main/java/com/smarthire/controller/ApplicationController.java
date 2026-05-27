package com.smarthire.controller;

import com.smarthire.dto.application.ApplicationRequest;
import com.smarthire.dto.application.ApplicationResponse;
import com.smarthire.dto.application.StatusUpdateRequest;
import com.smarthire.enums.ApplicationStatus;
import com.smarthire.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for job application management.
 * 
 * Applicant endpoints:
 *   POST /api/applications              — Apply to a job (with resume upload)
 *   GET  /api/applications/my           — View own applications
 *   PATCH /api/applications/{id}/withdraw — Withdraw an application
 * 
 * Recruiter endpoints:
 *   GET   /api/applications/job/{jobId}     — View applicants for a job
 *   PATCH /api/applications/{id}/status     — Update application status
 *   GET   /api/applications/{id}/resume     — Download applicant's resume
 *   GET   /api/applications/search          — Advanced candidate search
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * Applies to a job with optional resume upload (APPLICANT only).
     * Uses multipart form data: 'application' JSON part + 'resume' file part.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationResponse> applyToJob(
            @RequestPart("application") @Valid ApplicationRequest request,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            Authentication authentication) {
        ApplicationResponse response = applicationService.applyToJob(
                request, resume, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Gets the current applicant's applications (APPLICANT only).
     */
    @GetMapping("/my")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                applicationService.getMyApplications(authentication.getName(), pageable));
    }

    /**
     * Gets all applications for a specific job (RECRUITER only, must own the job).
     * Optional status filter.
     */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<Page<ApplicationResponse>> getApplicationsForJob(
            @PathVariable Long jobId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        ApplicationStatus appStatus = status != null
                ? ApplicationStatus.valueOf(status.toUpperCase()) : null;
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                applicationService.getApplicationsForJob(
                        jobId, appStatus, authentication.getName(), pageable));
    }

    /**
     * Updates the status of an application (RECRUITER only).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                applicationService.updateApplicationStatus(
                        id, request, authentication.getName()));
    }

    /**
     * Downloads an applicant's resume (RECRUITER only, must own the job).
     */
    @GetMapping("/{id}/resume")
    public ResponseEntity<Resource> downloadResume(
            @PathVariable Long id,
            Authentication authentication) {
        Resource resource = applicationService.downloadResume(id, authentication.getName());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /**
     * Advanced candidate search (RECRUITER only).
     * Filters by skills (FULLTEXT), experience range, status, and specific job.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ApplicationResponse>> searchCandidates(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) Integer experienceMin,
            @RequestParam(required = false) Integer experienceMax,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        ApplicationStatus appStatus = status != null
                ? ApplicationStatus.valueOf(status.toUpperCase()) : null;
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                applicationService.searchCandidates(
                        jobId, skills, experienceMin, experienceMax,
                        appStatus, authentication.getName(), pageable));
    }

    /**
     * Withdraws an application (APPLICANT only).
     */
    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<ApplicationResponse> withdrawApplication(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(
                applicationService.withdrawApplication(id, authentication.getName()));
    }
}
