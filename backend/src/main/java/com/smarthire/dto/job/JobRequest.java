package com.smarthire.dto.job;

import com.smarthire.enums.EmploymentType;
import com.smarthire.enums.JobStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request payload for creating or updating a job posting.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    @NotBlank(message = "Company name is required")
    @Size(max = 100, message = "Company name must not exceed 100 characters")
    private String company;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    @Size(max = 500, message = "Required skills must not exceed 500 characters")
    private String requiredSkills;

    private Integer experienceMinYears = 0;
    private Integer experienceMaxYears;

    private JobStatus status = JobStatus.OPEN;
}
