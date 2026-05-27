package com.smarthire.repository;

import com.smarthire.entity.Job;
import com.smarthire.enums.EmploymentType;
import com.smarthire.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for Job entity with custom search queries.
 * Uses native MySQL queries for FULLTEXT search and optimized filtering.
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    /**
     * Finds all jobs posted by a specific recruiter, ordered by creation date.
     */
    Page<Job> findByPostedByIdOrderByCreatedAtDesc(Long recruiterId, Pageable pageable);

    /**
     * Finds all open jobs, ordered by creation date (for applicant browsing).
     */
    Page<Job> findByStatusOrderByCreatedAtDesc(JobStatus status, Pageable pageable);

    /**
     * Advanced search query using dynamic filtering.
     * Uses MySQL FULLTEXT MATCH...AGAINST for keyword and skill searches.
     * All filter parameters are optional — null values are bypassed via COALESCE/OR logic.
     * 
     * This query leverages the following indexes:
     * - ft_jobs_title_desc (FULLTEXT on title, description)
     * - ft_jobs_skills (FULLTEXT on required_skills)
     * - idx_jobs_status (B-Tree on status)
     * - idx_jobs_location (B-Tree on location)
     * - idx_jobs_experience (Composite B-Tree on experience_min_years, experience_max_years)
     */
    @Query(value = """
            SELECT j.* FROM jobs j
            WHERE (:status IS NULL OR j.status = :status)
              AND (:location IS NULL OR j.location LIKE CONCAT('%', :location, '%'))
              AND (:employmentType IS NULL OR j.employment_type = :employmentType)
              AND (:experienceMin IS NULL OR j.experience_min_years >= :experienceMin)
              AND (:experienceMax IS NULL OR j.experience_max_years <= :experienceMax)
              AND (:company IS NULL OR j.company LIKE CONCAT('%', :company, '%'))
              AND (:keyword IS NULL OR MATCH(j.title, j.description) AGAINST(:keyword IN BOOLEAN MODE))
              AND (:skills IS NULL OR MATCH(j.required_skills) AGAINST(:skills IN BOOLEAN MODE))
            ORDER BY j.created_at DESC
            """,
            countQuery = """
            SELECT COUNT(*) FROM jobs j
            WHERE (:status IS NULL OR j.status = :status)
              AND (:location IS NULL OR j.location LIKE CONCAT('%', :location, '%'))
              AND (:employmentType IS NULL OR j.employment_type = :employmentType)
              AND (:experienceMin IS NULL OR j.experience_min_years >= :experienceMin)
              AND (:experienceMax IS NULL OR j.experience_max_years <= :experienceMax)
              AND (:company IS NULL OR j.company LIKE CONCAT('%', :company, '%'))
              AND (:keyword IS NULL OR MATCH(j.title, j.description) AGAINST(:keyword IN BOOLEAN MODE))
              AND (:skills IS NULL OR MATCH(j.required_skills) AGAINST(:skills IN BOOLEAN MODE))
            """,
            nativeQuery = true)
    Page<Job> searchJobs(
            @Param("keyword") String keyword,
            @Param("skills") String skills,
            @Param("location") String location,
            @Param("employmentType") String employmentType,
            @Param("experienceMin") Integer experienceMin,
            @Param("experienceMax") Integer experienceMax,
            @Param("status") String status,
            @Param("company") String company,
            Pageable pageable);
}
