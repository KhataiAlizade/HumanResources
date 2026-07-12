package com.example.demo.service;

import com.example.demo.dto.AssignSalaryDTO;
import com.example.demo.dto.CreateEmployeeDTO;
import com.example.demo.dto.EmployeeProjectDTO;
import com.example.demo.dto.EmployeeProfileDTO;
import com.example.demo.dto.RegisterEmployeeDTO;
import com.example.demo.dto.SubmitLeaveRequestDTO;
import com.example.demo.entity.Employee;
import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.ProjectReport;
import com.example.demo.entity.Salary;
import java.time.LocalDate;
import java.util.List;

public interface EmployeeService {

    Employee createEmployee(CreateEmployeeDTO request);

    void deleteEmployee(Long id);

    Employee registerEmployee(RegisterEmployeeDTO request);

    Salary assignSalary(AssignSalaryDTO request);

    List<Employee> getAllEmployees();

    EmployeeProfileDTO getMyProfile(String email);

    List<EmployeeProjectDTO> getMyProjects(String email);

    List<Salary> getMySalaryDetails(String email);

    LeaveRequest submitLeaveRequest(String email, SubmitLeaveRequestDTO request);

    List<LeaveRequest> getMyLeaveHistory(String email);

    List<ProjectReport> getAllReports();

    ProjectReport submitProjectReport(Long employeeId, Long projectId, String reportText);
}