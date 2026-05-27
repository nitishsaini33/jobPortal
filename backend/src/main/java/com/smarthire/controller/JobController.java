package com.smarthire.controller;

import com.smarthire.dto.job.JobRequest;
import com.smarthire.dto.job.JobResponse;
import com.smarthire.dto.job.JobSearchCriteria;
import com.smarthire.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for job posting management.
 * 
 * Public endpoints:
 *   GET  /api/jobs           — Browse open jobs (paginated)
 *   GET  /api/jobs/{id}      — View job details
 *   GET  /api/jobs/search    — Advanced job search with filters
 * 
 * Recruiter-only endpoints:
 *   POST   /api/jobs         — Create a job posting
 *   PUT    /api/jobs/{id}    — Update a job posting
 *   DELETE /api/jobs/{id}    — Delete a job posting
 *   GET    /api/jobs/my      — List recruiter's own postings
 */
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    /**
     * Creates a new job posting (RECRUITER only).
     */
    @PostMapping
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request,
                                                  Authentication authentication) {
        JobResponse response = jobService.createJob(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Updates an existing job posting (RECRUITER only, must be the owner).
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(@PathVariable Long id,
                                                  @Valid @RequestBody JobRequest request,
                                                  Authentication authentication) {
        JobResponse response = jobService.updateJob(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a job posting (RECRUITER only, must be the owner).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id,
                                           Authentication authentication) {
        jobService.deleteJob(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Gets a specific job posting by ID (public).
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }

    /**
     * Lists all open jobs with pagination (public, for applicant browsing).
     */
    @GetMapping
    public ResponseEntity<Page<JobResponse>> getOpenJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(jobService.getOpenJobs(pageable));
    }

    /**
     * Lists the recruiter's own job postings (RECRUITER only).
     */
    @GetMapping("/my")
    public ResponseEntity<Page<JobResponse>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(jobService.getMyJobs(authentication.getName(), pageable));
    }

    /**
     * Advanced job search with multiple filters (public).
     * Supports keyword, skills, location, employment type, experience range, status, company.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) Integer experienceMin,
            @RequestParam(required = false) Integer experienceMax,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String company,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        JobSearchCriteria criteria = new JobSearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setSkills(skills);
        criteria.setLocation(location);
        criteria.setCompany(company);
        criteria.setExperienceMin(experienceMin);
        criteria.setExperienceMax(experienceMax);

        if (employmentType != null) {
            criteria.setEmploymentType(
                    com.smarthire.enums.EmploymentType.valueOf(employmentType.toUpperCase()));
        }
        if (status != null) {
            criteria.setStatus(com.smarthire.enums.JobStatus.valueOf(status.toUpperCase()));
        }

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(jobService.searchJobs(criteria, pageable));
    }
}
