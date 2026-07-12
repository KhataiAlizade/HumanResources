package com.example.demo.dto;

import com.example.demo.entity.enums.LeaveRequestStatus;
import java.time.LocalDate;

public record AdminLeaveRequestDTO(
    Long id,
    Long employeeId,
    String employeeName,
    LocalDate startDate,
    LocalDate endDate,
    String reason,
    LeaveRequestStatus status
) {
}