package com.example.demo.dto;

import java.time.LocalDate;

public record EmployeeProjectDTO(
    Long projectId,
    String name,
    String description,
    LocalDate startDate,
    LocalDate endDate
) {
}