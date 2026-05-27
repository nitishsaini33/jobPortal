package com.smarthire.entity;

import com.smarthire.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Represents an applicant's application to a specific job posting.
 * Tracks the full recruitment pipeline from APPLIED through to OFFERED/REJECTED.
 * 
 * A unique constraint on (job_id, applicant_id) prevents duplicate applications.
 * FULLTEXT index on 'skills' enables fast candidate search by recruiters.
 */
@Entity
@Table(name = "applications",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_apps_job_applicant", columnNames = {"job_id", "applicant_id"})
    },
    indexes = {
        @Index(name = "idx_apps_job_id", columnList = "job_id"),
        @Index(name = "idx_apps_applicant_id", columnList = "applicant_id"),
        @Index(name = "idx_apps_status", columnList = "status"),
        @Index(name = "idx_apps_experience", columnList = "experience_years")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The job this application is for.
     * Lazy-loaded; we typically access job details via a separate query or DTO projection.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    /**
     * The applicant who submitted this application.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Column(name = "resume_path", length = 500)
    private String resumePath;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(length = 500)
    private String skills;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "recruiter_notes", columnDefinition = "TEXT")
    private String recruiterNotes;

    @CreationTimestamp
    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
