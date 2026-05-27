package com.smarthire.enums;

/**
 * Status values tracking an application through the recruitment pipeline.
 * 
 * Flow: APPLIED → REVIEWED → SHORTLISTED → INTERVIEWED → OFFERED / REJECTED
 *       (WITHDRAWN can occur at any stage by the applicant)
 */
public enum ApplicationStatus {
    APPLIED,
    REVIEWED,
    SHORTLISTED,
    INTERVIEWED,
    OFFERED,
    REJECTED,
    WITHDRAWN
}
