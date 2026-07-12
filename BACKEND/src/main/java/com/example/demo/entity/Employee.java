package com.example.demo.entity;

import com.example.demo.entity.enums.Role;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Column(name = "first_name", nullable = false, length = 50)
    @ToString.Include
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    @ToString.Include
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    @ToString.Include
    private String email;

    @JsonProperty("password")
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @ToString.Include
    private Role role = Role.EMPLOYEE;

    @Column(name = "is_approved")
    @ToString.Include
    private Boolean isApproved = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @ToString.Exclude
    private Department department;

    @Column(precision = 10, scale = 2)
    @ToString.Include
    private BigDecimal salary;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "hire_date")
    @ToString.Include
    private LocalDate hireDate;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "employee_projects",
        joinColumns = @JoinColumn(name = "employee_id"),
        inverseJoinColumns = @JoinColumn(name = "project_id")
    )
    @ToString.Exclude
    private Set<Project> projects = new HashSet<>();

    @PrePersist
    void applyDefaults() {
        if (role == null) {
            role = Role.EMPLOYEE;
        }
        if (isApproved == null) {
            isApproved = Boolean.FALSE;
        }
        if (hireDate == null) {
            hireDate = LocalDate.now();
        }
    }
}