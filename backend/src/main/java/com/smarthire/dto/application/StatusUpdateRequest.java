package com.smarthire.dto.application;

import com.smarthire.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for a recruiter to update an application's status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @NotNull(message = "Application status is required")
    private ApplicationStatus status;

    /** Optional notes from the recruiter about this status change */
    private String recruiterNotes;
}
