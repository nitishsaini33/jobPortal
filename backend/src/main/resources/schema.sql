-- ============================================================
-- SmartHire Portal — Complete Database Schema
-- MySQL 8.x Compatible
-- ============================================================

-- ============================================================
-- 1. ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(20)     NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default roles
INSERT IGNORE INTO roles (name) VALUES ('RECRUITER'), ('APPLICANT');


-- ============================================================
-- 2. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20),
    profile_summary TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. USER_ROLES JOIN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id     BIGINT      NOT NULL,
    role_id     INT         NOT NULL,

    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. JOBS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    title               VARCHAR(200)    NOT NULL,
    description         TEXT            NOT NULL,
    company             VARCHAR(100)    NOT NULL,
    location            VARCHAR(100),
    employment_type     ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP') NOT NULL DEFAULT 'FULL_TIME',
    salary_min          DECIMAL(12,2),
    salary_max          DECIMAL(12,2),
    required_skills     VARCHAR(500),
    experience_min_years INT            DEFAULT 0,
    experience_max_years INT,
    status              ENUM('OPEN', 'CLOSED', 'DRAFT') NOT NULL DEFAULT 'OPEN',
    posted_by           BIGINT          NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Key
    CONSTRAINT fk_jobs_posted_by FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE,

    -- B-Tree Indexes for filtering
    INDEX idx_jobs_status (status),
    INDEX idx_jobs_posted_by (posted_by),
    INDEX idx_jobs_location (location),
    INDEX idx_jobs_experience (experience_min_years, experience_max_years),
    INDEX idx_jobs_employment_type (employment_type),

    -- FULLTEXT Indexes for keyword search
    FULLTEXT INDEX ft_jobs_skills (required_skills),
    FULLTEXT INDEX ft_jobs_title_desc (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. APPLICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    job_id          BIGINT          NOT NULL,
    applicant_id    BIGINT          NOT NULL,
    resume_path     VARCHAR(500),
    cover_letter    TEXT,
    skills          VARCHAR(500),
    experience_years INT            DEFAULT 0,
    status          ENUM('APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'REJECTED', 'WITHDRAWN')
                                    NOT NULL DEFAULT 'APPLIED',
    recruiter_notes TEXT,
    applied_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_apps_job       FOREIGN KEY (job_id)       REFERENCES jobs(id)  ON DELETE CASCADE,
    CONSTRAINT fk_apps_applicant FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Unique Constraint: one application per user per job
    CONSTRAINT uq_apps_job_applicant UNIQUE (job_id, applicant_id),

    -- B-Tree Indexes
    INDEX idx_apps_job_id (job_id),
    INDEX idx_apps_applicant_id (applicant_id),
    INDEX idx_apps_status (status),
    INDEX idx_apps_experience (experience_years),

    -- FULLTEXT Index for candidate skill search
    FULLTEXT INDEX ft_apps_skills (skills)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
