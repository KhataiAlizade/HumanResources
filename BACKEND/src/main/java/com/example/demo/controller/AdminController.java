package com.example.demo.controller;

import com.example.demo.dto.AssignProjectDTO;
import com.example.demo.dto.AssignProjectRequestDTO;
import com.example.demo.dto.AdminLeaveRequestDTO;
import com.example.demo.dto.CreateEmployeeDTO;
import com.example.demo.dto.EmployeeDTO;
import com.example.demo.dto.AssignSalaryDTO;
import com.example.demo.dto.CreateProjectDTO;
import com.example.demo.dto.RegisterEmployeeDTO;
import com.example.demo.dto.SalaryUpdateRequestDTO;
import com.example.demo.dto.UpdateLeaveStatusDTO;
import com.example.demo.entity.Department;
import com.example.demo.entity.Employee;
import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.ProjectAssignment;
import com.example.demo.entity.Salary;
import com.example.demo.service.AdminService;
import com.example.demo.service.DepartmentService;
import com.example.demo.service.EmployeeService;
import com.example.demo.service.ProjectService;
import com.example.demo.entity.ProjectReport;
import com.example.demo.service.dto.DashboardMetrics;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final DepartmentService departmentService;
    private final EmployeeService employeeService;
    private final ProjectService projectService;

    public AdminController(
        AdminService adminService,
        DepartmentService departmentService,
        EmployeeService employeeService,
        ProjectService projectService
    ) {
        this.adminService = adminService;
        this.departmentService = departmentService;
        this.employeeService = employeeService;
        this.projectService = projectService;
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ProjectReport>> getAllReports() {
        return ResponseEntity.ok(employeeService.getAllReports());
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<Map<String, String>> approveEmployee(@PathVariable Long id) {
        adminService.approveEmployee(id);
        return ResponseEntity.ok(Map.of("message", "Employee approved successfully"));
    }

    @PostMapping("/assign-project")
    public ResponseEntity<Map<String, String>> assignProject(@RequestBody AssignProjectRequestDTO request) {
        adminService.assignProject(request.employeeId(), request.projectId());
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "Project assigned successfully"));
    }

    @PostMapping("/project-assignments")
    public ResponseEntity<ProjectAssignment> createProjectAssignment(@RequestBody AssignProjectDTO request) {
        ProjectAssignment savedAssignment = projectService.assignProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAssignment);
    }

    @PostMapping("/salary")
    public ResponseEntity<Map<String, String>> updateSalary(@RequestBody SalaryUpdateRequestDTO request) {
        adminService.updateSalary(request.employeeId(), request.salary());
        return ResponseEntity.ok(Map.of("message", "Salary updated successfully"));
    }

    @GetMapping("/leaves")
    public ResponseEntity<List<AdminLeaveRequestDTO>> getPendingLeaves() {
        return ResponseEntity.ok(adminService.getPendingLeaveRequests());
    }

    @PutMapping("/leaves/{id}/status")
    public ResponseEntity<LeaveRequest> updateLeaveStatus(
        @PathVariable Long id,
        @RequestBody UpdateLeaveStatusDTO request
    ) {
        LeaveRequest updated = adminService.updateLeaveStatus(id, request.status());
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/projects")
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetrics> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardMetrics());
    }

    @PostMapping("/employees")
    public ResponseEntity<Employee> createEmployee(@RequestBody CreateEmployeeDTO request) {
        Employee savedEmployee = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEmployee);
    }

    @PostMapping("/projects")
    public ResponseEntity<com.example.demo.entity.Project> createProject(@RequestBody CreateProjectDTO request) {
        Project savedProject = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProject);
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }

    @PostMapping("/salaries")
    public ResponseEntity<Salary> assignSalary(@RequestBody AssignSalaryDTO request) {
        Salary savedSalary = employeeService.assignSalary(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSalary);
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees().stream()
            .map(employee -> new EmployeeDTO(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getRole(),
                employee.getDepartment() != null ? employee.getDepartment().getName() : null,
                employee.getSkills()
            ))
            .toList());
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Map<String, String>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
    }
}