package com.example.demo.dto;

public record CreateEmployeeDTO(
    String firstName,
    String lastName,
    String email,
    String password,
    Long departmentId,
    String skills
) {
}