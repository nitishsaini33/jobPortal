package com.smarthire.dto.job;

import com.smarthire.enums.EmploymentType;
import com.smarthire.enums.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Search criteria for filtering job postings.
 * All fields are optional — null fields are excluded from the query.
 * Used with Spring Data JPA Specification or custom @Query for dynamic filtering.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobSearchCriteria {

    /** Keyword search across title, description (uses FULLTEXT index) */
    private String keyword;

    /** Skill keyword search (uses FULLTEXT index on required_skills) */
    private String skills;

    /** Filter by location (exact or partial match) */
    private String location;

    /** Filter by employment type */
    private EmploymentType employmentType;

    /** Filter by minimum experience requirement */
    private Integer experienceMin;

    /** Filter by maximum experience requirement */
    private Integer experienceMax;

    /** Filter by job status (default: OPEN) */
    private JobStatus status;

    /** Filter by company name */
    private String company;
}
