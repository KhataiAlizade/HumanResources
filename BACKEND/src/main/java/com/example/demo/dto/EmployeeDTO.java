package com.example.demo.dto;

import com.example.demo.entity.enums.Role;

public record EmployeeDTO(
    Long id,
    String firstName,
    String lastName,
    String email,
    Role role,
    String department,
    String skills
) {
}