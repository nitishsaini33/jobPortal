package com.smarthire.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a security role in the system (e.g., RECRUITER, APPLICANT).
 * Mapped to the 'roles' table. Seeded via schema.sql.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String name;
}
