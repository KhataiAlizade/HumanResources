package com.example.demo.dto;

import com.example.demo.entity.enums.LeaveRequestStatus;

public record UpdateLeaveStatusDTO(LeaveRequestStatus status) {
}