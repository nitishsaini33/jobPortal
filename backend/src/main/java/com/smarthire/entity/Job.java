package com.smarthire.entity;

import com.smarthire.enums.EmploymentType;
import com.smarthire.enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a job posting created by a recruiter.
 * Contains FULLTEXT-indexed fields (required_skills, title+description) for
 * high-performance keyword search.
 */
@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_jobs_status", columnList = "status"),
    @Index(name = "idx_jobs_posted_by", columnList = "posted_by"),
    @Index(name = "idx_jobs_location", columnList = "location"),
    @Index(name = "idx_jobs_experience", columnList = "experience_min_years, experience_max_years"),
    @Index(name = "idx_jobs_employment_type", columnList = "employment_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String company;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    @Builder.Default
    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "required_skills", length = 500)
    private String requiredSkills;

    @Column(name = "experience_min_years")
    @Builder.Default
    private Integer experienceMinYears = 0;

    @Column(name = "experience_max_years")
    private Integer experienceMaxYears;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    /**
     * The recruiter who created this job posting.
     * Lazy-loaded since we usually just need the ID for authorization checks.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
