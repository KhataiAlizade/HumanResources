package com.example.demo.dto;

import com.example.demo.entity.enums.Role;

public record RegisterEmployeeDTO(
    String fullName,
    String email,
    String password,
    Role role,
    String department
) {
}