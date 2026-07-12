package com.example.demo.dto;

public record EmployeeProfileDTO(
    String name,
    String surname,
    String email,
    String role,
    String department
) {
}