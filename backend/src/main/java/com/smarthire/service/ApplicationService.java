package com.smarthire.service;

import com.smarthire.dto.application.ApplicationRequest;
import com.smarthire.dto.application.ApplicationResponse;
import com.smarthire.dto.application.StatusUpdateRequest;
import com.smarthire.entity.Application;
import com.smarthire.entity.Job;
import com.smarthire.entity.User;
import com.smarthire.enums.ApplicationStatus;
import com.smarthire.enums.JobStatus;
import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.repository.JobRepository;
import com.smarthire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service handling job application business logic.
 * 
 * - Applicants can apply to open jobs with resume upload
 * - Recruiters can view applicants, update statuses, download resumes
 * - Advanced candidate search with FULLTEXT skill matching
 */
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    /**
     * Submits a new application for a job with optional resume upload.
     */
    @Transactional
    public ApplicationResponse applyToJob(ApplicationRequest request,
                                           MultipartFile resume,
                                           String applicantEmail) {
        User applicant = getUserByEmail(applicantEmail);
        Job job = getJobById(request.getJobId());

        // Validate job is open
        if (job.getStatus() != JobStatus.OPEN) {
            throw new BadRequestException("This job is no longer accepting applications");
        }

        // Check for duplicate application
        if (applicationRepository.existsByJobIdAndApplicantId(job.getId(), applicant.getId())) {
            throw new BadRequestException("You have already applied to this job");
        }

        // Store resume if provided
        String resumePath = null;
        if (resume != null && !resume.isEmpty()) {
            resumePath = fileStorageService.storeFile(resume);
        }

        Application application = Application.builder()
                .job(job)
                .applicant(applicant)
                .resumePath(resumePath)
                .coverLetter(request.getCoverLetter())
                .skills(request.getSkills())
                .experienceYears(request.getExperienceYears())
                .build();

        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    /**
     * Gets all applications submitted by the current applicant.
     */
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getMyApplications(String applicantEmail, Pageable pageable) {
        User applicant = getUserByEmail(applicantEmail);
        return applicationRepository.findByApplicantIdOrderByAppliedAtDesc(
                applicant.getId(), pageable)
                .map(this::mapToResponse);
    }

    /**
     * Gets all applications for a specific job (recruiter view).
     * Validates that the requesting recruiter owns the job.
     */
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsForJob(Long jobId,
                                                            ApplicationStatus status,
                                                            String recruiterEmail,
                                                            Pageable pageable) {
        Job job = getJobById(jobId);
        validateJobOwnership(job, recruiterEmail);

        if (status != null) {
            return applicationRepository.findByJobIdAndStatusOrderByAppliedAtDesc(
                    jobId, status, pageable)
                    .map(this::mapToResponse);
        }
        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Updates the status of an application (recruiter action).
     * Validates that the recruiter owns the job this application belongs to.
     */
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId,
                                                        StatusUpdateRequest request,
                                                        String recruiterEmail) {
        Application application = getApplicationById(applicationId);
        validateJobOwnership(application.getJob(), recruiterEmail);

        application.setStatus(request.getStatus());
        if (request.getRecruiterNotes() != null) {
            application.setRecruiterNotes(request.getRecruiterNotes());
        }

        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    /**
     * Downloads a resume file for a specific application (recruiter action).
     */
    @Transactional(readOnly = true)
    public Resource downloadResume(Long applicationId, String recruiterEmail) {
        Application application = getApplicationById(applicationId);
        validateJobOwnership(application.getJob(), recruiterEmail);

        if (application.getResumePath() == null) {
            throw new ResourceNotFoundException("No resume uploaded for this application");
        }

        return fileStorageService.loadFileAsResource(application.getResumePath());
    }

    /**
     * Advanced candidate search for recruiters.
     * Filters across all applications for the recruiter's jobs.
     */
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> searchCandidates(Long jobId,
                                                       String skills,
                                                       Integer experienceMin,
                                                       Integer experienceMax,
                                                       ApplicationStatus status,
                                                       String recruiterEmail,
                                                       Pageable pageable) {
        User recruiter = getUserByEmail(recruiterEmail);
        String statusStr = status != null ? status.name() : null;

        return applicationRepository.searchCandidates(
                recruiter.getId(), jobId, skills,
                experienceMin, experienceMax, statusStr, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Allows an applicant to withdraw their application.
     */
    @Transactional
    public ApplicationResponse withdrawApplication(Long applicationId, String applicantEmail) {
        Application application = getApplicationById(applicationId);
        User applicant = getUserByEmail(applicantEmail);

        if (!application.getApplicant().getId().equals(applicant.getId())) {
            throw new BadRequestException("You can only withdraw your own applications");
        }

        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Application is already withdrawn");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    // ---- Private helpers ----

    private Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
    }

    private Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private void validateJobOwnership(Job job, String recruiterEmail) {
        if (!job.getPostedBy().getEmail().equals(recruiterEmail)) {
            throw new BadRequestException("You are not authorized to manage applications for this job");
        }
    }

    private ApplicationResponse mapToResponse(Application app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .jobCompany(app.getJob().getCompany())
                .applicantId(app.getApplicant().getId())
                .applicantName(app.getApplicant().getFullName())
                .applicantEmail(app.getApplicant().getEmail())
                .resumePath(app.getResumePath())
                .hasResume(app.getResumePath() != null)
                .coverLetter(app.getCoverLetter())
                .skills(app.getSkills())
                .experienceYears(app.getExperienceYears())
                .status(app.getStatus())
                .recruiterNotes(app.getRecruiterNotes())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
