package com.example.demo.controller;

import com.example.demo.dto.EmployeeProjectDTO;
import com.example.demo.dto.EmployeeProfileDTO;
import com.example.demo.dto.LeaveRequestDTO;
import com.example.demo.dto.SubmitLeaveRequestDTO;
import com.example.demo.dto.ProjectReportRequestDTO;
import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.ProjectReport;
import com.example.demo.entity.Salary;
import com.example.demo.service.EmployeeService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/leave")
    public ResponseEntity<LeaveRequest> submitLeaveRequest(@RequestBody SubmitLeaveRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        LeaveRequest savedLeaveRequest = employeeService.submitLeaveRequest(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLeaveRequest);
    }

    @GetMapping("/leave")
    public ResponseEntity<List<LeaveRequest>> getMyLeaveHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(employeeService.getMyLeaveHistory(email));
    }

    @PostMapping("/report")
    public ResponseEntity<ProjectReport> submitProjectReport(@RequestBody ProjectReportRequestDTO request) {
        ProjectReport savedReport = employeeService.submitProjectReport(
            request.employeeId(),
            request.projectId(),
            request.reportText()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
    }

    @GetMapping("/my-projects")
    public ResponseEntity<List<EmployeeProjectDTO>> getMyProjects() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(employeeService.getMyProjects(email));
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeProfileDTO> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(employeeService.getMyProfile(email));
    }

    @GetMapping("/salary")
    public ResponseEntity<List<Salary>> getMySalary() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(employeeService.getMySalaryDetails(email));
    }

    @GetMapping("/salary-details")
    public ResponseEntity<List<Salary>> getSalaryDetails() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(employeeService.getMySalaryDetails(email));
    }
}