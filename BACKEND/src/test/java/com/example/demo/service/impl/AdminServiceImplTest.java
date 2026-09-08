package com.example.demo.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.demo.dto.AdminLeaveRequestDTO;
import com.example.demo.entity.Employee;
import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.enums.LeaveRequestStatus;
import com.example.demo.entity.enums.Role;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.service.dto.DashboardMetrics;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    @Test
    void approveEmployeeSetsApprovedFlag() {
        Employee employee = employee(1L, "jane@example.com");
        employee.setIsApproved(Boolean.FALSE);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        adminService.approveEmployee(1L);

        assertEquals(Boolean.TRUE, employee.getIsApproved());
        verify(employeeRepository).save(employee);
    }

    @Test
    void approveEmployeeThrowsWhenMissing() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> adminService.approveEmployee(1L));

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void assignProjectAddsProjectToEmployee() {
        Employee employee = employee(2L, "jane@example.com");
        Project project = project(3L, "Payroll");
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(3L)).thenReturn(Optional.of(project));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        adminService.assignProject(2L, 3L);

        assertEquals(1, employee.getProjects().size());
        assertEquals(project, employee.getProjects().iterator().next());
        verify(employeeRepository).save(employee);
    }

    @Test
    void assignProjectThrowsWhenEmployeeMissing() {
        when(employeeRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> adminService.assignProject(2L, 3L));

        verify(projectRepository, never()).findById(anyLong());
        verify(employeeRepository, never()).save(any());
    }

    @Test
    void assignProjectThrowsWhenProjectMissing() {
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee(2L, "jane@example.com")));
        when(projectRepository.findById(3L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> adminService.assignProject(2L, 3L));

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void updateSalarySetsSalaryAndSavesEmployee() {
        Employee employee = employee(4L, "jane@example.com");
        when(employeeRepository.findById(4L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        adminService.updateSalary(4L, new BigDecimal("6200.00"));

        assertEquals(new BigDecimal("6200.00"), employee.getSalary());
        verify(employeeRepository).save(employee);
    }

    @Test
    void updateSalaryRejectsNullSalary() {
        when(employeeRepository.findById(4L)).thenReturn(Optional.of(employee(4L, "jane@example.com")));

        assertThrows(NullPointerException.class, () -> adminService.updateSalary(4L, null));

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void getDashboardMetricsReturnsCounts() {
        when(employeeRepository.count()).thenReturn(8L);
        when(projectRepository.count()).thenReturn(3L);

        DashboardMetrics metrics = adminService.getDashboardMetrics();

        assertEquals(8L, metrics.employeeCount());
        assertEquals(3L, metrics.projectCount());
    }

    @Test
    void getPendingLeaveRequestsMapsEmployeeNameAndNullEmployee() {
        LeaveRequest withEmployee = new LeaveRequest();
        withEmployee.setId(1L);
        withEmployee.setEmployee(employee(5L, "jane@example.com"));
        withEmployee.setStartDate(LocalDate.of(2026, 1, 1));
        withEmployee.setEndDate(LocalDate.of(2026, 1, 5));
        withEmployee.setReason("Vacation");
        withEmployee.setStatus(LeaveRequestStatus.PENDING);

        LeaveRequest withoutEmployee = new LeaveRequest();
        withoutEmployee.setId(2L);
        withoutEmployee.setEmployee(null);
        withoutEmployee.setStartDate(LocalDate.of(2026, 2, 1));
        withoutEmployee.setEndDate(LocalDate.of(2026, 2, 5));
        withoutEmployee.setReason("Sick leave");
        withoutEmployee.setStatus(LeaveRequestStatus.PENDING);

        when(leaveRequestRepository.findByStatus(LeaveRequestStatus.PENDING)).thenReturn(List.of(withEmployee, withoutEmployee));

        List<AdminLeaveRequestDTO> result = adminService.getPendingLeaveRequests();

        assertEquals(2, result.size());
        assertEquals("Jane Doe", result.get(0).employeeName());
        assertEquals(null, result.get(1).employeeName());
    }

    @Test
    void updateLeaveStatusSetsStatusAndSaves() {
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setId(6L);
        leaveRequest.setStatus(LeaveRequestStatus.PENDING);
        when(leaveRequestRepository.findById(6L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveRequest updated = adminService.updateLeaveStatus(6L, LeaveRequestStatus.APPROVED);

        assertEquals(LeaveRequestStatus.APPROVED, updated.getStatus());
        verify(leaveRequestRepository).save(leaveRequest);
    }

    @Test
    void updateLeaveStatusRejectsNullStatus() {
        when(leaveRequestRepository.findById(6L)).thenReturn(Optional.of(new LeaveRequest()));

        assertThrows(NullPointerException.class, () -> adminService.updateLeaveStatus(6L, null));

        verify(leaveRequestRepository, never()).save(any());
    }

    @Test
    void updateLeaveStatusThrowsWhenMissing() {
        when(leaveRequestRepository.findById(6L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> adminService.updateLeaveStatus(6L, LeaveRequestStatus.APPROVED));

        verify(leaveRequestRepository, never()).save(any());
    }

    private Employee employee(Long id, String email) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setEmail(email);
        employee.setFirstName("Jane");
        employee.setLastName("Doe");
        employee.setRole(Role.EMPLOYEE);
        return employee;
    }

    private Project project(Long id, String name) {
        Project project = new Project();
        project.setId(id);
        project.setName(name);
        project.setDescription("Description");
        project.setStartDate(LocalDate.of(2026, 1, 1));
        project.setEndDate(LocalDate.of(2026, 12, 31));
        return project;
    }
}