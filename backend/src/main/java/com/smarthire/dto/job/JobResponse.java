package com.smarthire.dto.job;

import com.smarthire.enums.EmploymentType;
import com.smarthire.enums.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response payload representing a job posting.
 * Used for both list views and detail views.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {

    private Long id;
    private String title;
    private String description;
    private String company;
    private String location;
    private EmploymentType employmentType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String requiredSkills;
    private Integer experienceMinYears;
    private Integer experienceMaxYears;
    private JobStatus status;
    private Long postedById;
    private String postedByName;
    private int applicationCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
