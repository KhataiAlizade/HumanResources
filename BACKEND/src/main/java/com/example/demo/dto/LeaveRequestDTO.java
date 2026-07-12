package com.example.demo.dto;

import java.time.LocalDate;

public record LeaveRequestDTO(Long employeeId, LocalDate fromDate, LocalDate toDate, String reason) {
}