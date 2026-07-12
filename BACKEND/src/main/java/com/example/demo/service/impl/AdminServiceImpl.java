package com.example.demo.service.impl;

import com.example.demo.dto.AdminLeaveRequestDTO;
import com.example.demo.entity.Employee;
import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.enums.LeaveRequestStatus;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.service.AdminService;
import com.example.demo.service.dto.DashboardMetrics;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public AdminServiceImpl(
        EmployeeRepository employeeRepository,
        ProjectRepository projectRepository,
        LeaveRequestRepository leaveRequestRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Override
    public void approveEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + employeeId));
        employee.setIsApproved(Boolean.TRUE);
        employeeRepository.save(employee);
    }

    @Override
    public void assignProject(Long employeeId, Long projectId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + employeeId));
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));

        employee.getProjects().add(project);
        employeeRepository.save(employee);
    }

    @Override
    public void updateSalary(Long employeeId, BigDecimal salary) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + employeeId));

        employee.setSalary(Objects.requireNonNull(salary, "salary must not be null"));
        employeeRepository.save(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardMetrics getDashboardMetrics() {
        return new DashboardMetrics(employeeRepository.count(), projectRepository.count());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminLeaveRequestDTO> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus(LeaveRequestStatus.PENDING).stream()
            .map(this::toAdminLeaveRequestDTO)
            .toList();
    }

    @Override
    public LeaveRequest updateLeaveStatus(Long id, LeaveRequestStatus status) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Leave request not found: " + id));

        leaveRequest.setStatus(Objects.requireNonNull(status, "status must not be null"));
        return leaveRequestRepository.save(leaveRequest);
    }

    private AdminLeaveRequestDTO toAdminLeaveRequestDTO(LeaveRequest leaveRequest) {
        Employee employee = leaveRequest.getEmployee();
        String employeeName = employee != null
            ? employee.getFirstName() + " " + employee.getLastName()
            : null;

        return new AdminLeaveRequestDTO(
            leaveRequest.getId(),
            employee != null ? employee.getId() : null,
            employeeName,
            leaveRequest.getStartDate(),
            leaveRequest.getEndDate(),
            leaveRequest.getReason(),
            leaveRequest.getStatus()
        );
    }
}