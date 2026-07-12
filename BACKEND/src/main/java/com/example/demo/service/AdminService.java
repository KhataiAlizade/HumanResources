package com.example.demo.service;

import com.example.demo.dto.AdminLeaveRequestDTO;
import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.enums.LeaveRequestStatus;
import com.example.demo.service.dto.DashboardMetrics;
import java.math.BigDecimal;
import java.util.List;

public interface AdminService {

    void approveEmployee(Long employeeId);

    void assignProject(Long employeeId, Long projectId);

    void updateSalary(Long employeeId, BigDecimal salary);

    DashboardMetrics getDashboardMetrics();

    List<AdminLeaveRequestDTO> getPendingLeaveRequests();

    LeaveRequest updateLeaveStatus(Long id, LeaveRequestStatus status);
}