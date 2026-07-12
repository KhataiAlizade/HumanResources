package com.example.demo.dto;

import java.time.LocalDate;

public record CreateProjectDTO(
    String name,
    String description,
    LocalDate startDate,
    LocalDate endDate
) {
}