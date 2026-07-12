package com.example.demo.dto;

import java.time.LocalDate;

public record SubmitLeaveRequestDTO(
    LocalDate startDate,
    LocalDate endDate,
    String reason
) {
}