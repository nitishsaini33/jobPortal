package com.smarthire.service;

import com.smarthire.dto.job.JobRequest;
import com.smarthire.dto.job.JobResponse;
import com.smarthire.dto.job.JobSearchCriteria;
import com.smarthire.entity.Job;
import com.smarthire.entity.User;
import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.repository.JobRepository;
import com.smarthire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling all job posting business logic.
 * Enforces recruiter ownership for updates/deletes.
 */
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    /**
     * Creates a new job posting for the given recruiter.
     */
    @Transactional
    public JobResponse createJob(JobRequest request, String recruiterEmail) {
        User recruiter = getUserByEmail(recruiterEmail);

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .company(request.getCompany())
                .location(request.getLocation())
                .employmentType(request.getEmploymentType())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .requiredSkills(request.getRequiredSkills())
                .experienceMinYears(request.getExperienceMinYears())
                .experienceMaxYears(request.getExperienceMaxYears())
                .status(request.getStatus())
                .postedBy(recruiter)
                .build();

        job = jobRepository.save(job);
        return mapToResponse(job);
    }

    /**
     * Updates an existing job posting. Only the recruiter who created it can update.
     */
    @Transactional
    public JobResponse updateJob(Long jobId, JobRequest request, String recruiterEmail) {
        Job job = getJobById(jobId);
        validateOwnership(job, recruiterEmail);

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setEmploymentType(request.getEmploymentType());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setExperienceMinYears(request.getExperienceMinYears());
        job.setExperienceMaxYears(request.getExperienceMaxYears());
        job.setStatus(request.getStatus());

        job = jobRepository.save(job);
        return mapToResponse(job);
    }

    /**
     * Deletes a job posting. Only the recruiter who created it can delete.
     */
    @Transactional
    public void deleteJob(Long jobId, String recruiterEmail) {
        Job job = getJobById(jobId);
        validateOwnership(job, recruiterEmail);
        
        // Delete all associated applications first to prevent FK constraint failure
        applicationRepository.deleteByJobId(jobId);
        
        jobRepository.delete(job);
    }

    /**
     * Gets a single job posting by ID (public access).
     */
    @Transactional(readOnly = true)
    public JobResponse getJob(Long jobId) {
        Job job = getJobById(jobId);
        return mapToResponse(job);
    }

    /**
     * Lists all open jobs with pagination (for applicant browsing).
     */
    @Transactional(readOnly = true)
    public Page<JobResponse> getOpenJobs(Pageable pageable) {
        return jobRepository.findByStatusOrderByCreatedAtDesc(
                com.smarthire.enums.JobStatus.OPEN, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Lists jobs posted by a specific recruiter.
     */
    @Transactional(readOnly = true)
    public Page<JobResponse> getMyJobs(String recruiterEmail, Pageable pageable) {
        User recruiter = getUserByEmail(recruiterEmail);
        return jobRepository.findByPostedByIdOrderByCreatedAtDesc(recruiter.getId(), pageable)
                .map(this::mapToResponse);
    }

    /**
     * Advanced job search with multiple filters and pagination.
     * Uses FULLTEXT indexes for keyword and skill searches.
     */
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(JobSearchCriteria criteria, Pageable pageable) {
        String employmentType = criteria.getEmploymentType() != null
                ? criteria.getEmploymentType().name() : null;
        String status = criteria.getStatus() != null
                ? criteria.getStatus().name() : null;

        return jobRepository.searchJobs(
                criteria.getKeyword(),
                criteria.getSkills(),
                criteria.getLocation(),
                employmentType,
                criteria.getExperienceMin(),
                criteria.getExperienceMax(),
                status,
                criteria.getCompany(),
                pageable
        ).map(this::mapToResponse);
    }

    // ---- Private helpers ----

    private Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private void validateOwnership(Job job, String recruiterEmail) {
        if (!job.getPostedBy().getEmail().equals(recruiterEmail)) {
            throw new BadRequestException("You are not authorized to modify this job posting");
        }
    }

    private JobResponse mapToResponse(Job job) {
        long appCount = applicationRepository.countByJobId(job.getId());

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .company(job.getCompany())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .requiredSkills(job.getRequiredSkills())
                .experienceMinYears(job.getExperienceMinYears())
                .experienceMaxYears(job.getExperienceMaxYears())
                .status(job.getStatus())
                .postedById(job.getPostedBy().getId())
                .postedByName(job.getPostedBy().getFullName())
                .applicationCount((int) appCount)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
