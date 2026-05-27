package com.smarthire.repository;

import com.smarthire.entity.Application;
import com.smarthire.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Application entity with custom queries for
 * recruiter candidate search and applicant tracking.
 */
@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    /**
     * Checks if an applicant has already applied to a specific job.
     */
    boolean existsByJobIdAndApplicantId(Long jobId, Long applicantId);

    /**
     * Finds an application by job and applicant (for duplicate check).
     */
    Optional<Application> findByJobIdAndApplicantId(Long jobId, Long applicantId);

    /**
     * Finds all applications submitted by a specific applicant.
     */
    Page<Application> findByApplicantIdOrderByAppliedAtDesc(Long applicantId, Pageable pageable);

    /**
     * Finds all applications for a specific job (recruiter view).
     */
    Page<Application> findByJobIdOrderByAppliedAtDesc(Long jobId, Pageable pageable);

    /**
     * Finds all applications for a specific job filtered by status.
     */
    Page<Application> findByJobIdAndStatusOrderByAppliedAtDesc(
            Long jobId, ApplicationStatus status, Pageable pageable);

    /**
     * Advanced candidate search for recruiters.
     * Filters candidates by skills (FULLTEXT), experience, and application status.
     * Optionally scoped to a specific job.
     * 
     * Leverages indexes:
     * - ft_apps_skills (FULLTEXT on skills)
     * - idx_apps_status (B-Tree on status)
     * - idx_apps_experience (B-Tree on experience_years)
     * - idx_apps_job_id (B-Tree on job_id)
     */
    @Query(value = """
            SELECT a.* FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.posted_by = :recruiterId
              AND (:jobId IS NULL OR a.job_id = :jobId)
              AND (:status IS NULL OR a.status = :status)
              AND (:experienceMin IS NULL OR a.experience_years >= :experienceMin)
              AND (:experienceMax IS NULL OR a.experience_years <= :experienceMax)
              AND (:skills IS NULL OR MATCH(a.skills) AGAINST(:skills IN BOOLEAN MODE))
            ORDER BY a.applied_at DESC
            """,
            countQuery = """
            SELECT COUNT(*) FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.posted_by = :recruiterId
              AND (:jobId IS NULL OR a.job_id = :jobId)
              AND (:status IS NULL OR a.status = :status)
              AND (:experienceMin IS NULL OR a.experience_years >= :experienceMin)
              AND (:experienceMax IS NULL OR a.experience_years <= :experienceMax)
              AND (:skills IS NULL OR MATCH(a.skills) AGAINST(:skills IN BOOLEAN MODE))
            """,
            nativeQuery = true)
    Page<Application> searchCandidates(
            @Param("recruiterId") Long recruiterId,
            @Param("jobId") Long jobId,
            @Param("skills") String skills,
            @Param("experienceMin") Integer experienceMin,
            @Param("experienceMax") Integer experienceMax,
            @Param("status") String status,
            Pageable pageable);

    /**
     * Counts total applications for a specific job.
     */
    long countByJobId(Long jobId);

    /**
     * Deletes all applications for a specific job (used when deleting a job).
     */
    @Modifying
    @Query("DELETE FROM Application a WHERE a.job.id = :jobId")
    void deleteByJobId(@Param("jobId") Long jobId);
}
