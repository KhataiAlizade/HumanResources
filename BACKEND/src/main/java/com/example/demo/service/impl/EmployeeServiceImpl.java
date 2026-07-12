package com.example.demo.service.impl;

import com.example.demo.dto.AssignSalaryDTO;
import com.example.demo.dto.CreateEmployeeDTO;
import com.example.demo.dto.EmployeeProjectDTO;
import com.example.demo.dto.EmployeeProfileDTO;
import com.example.demo.dto.RegisterEmployeeDTO;
import com.example.demo.dto.SubmitLeaveRequestDTO;
import com.example.demo.entity.Department;
import com.example.demo.entity.Employee;
import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.ProjectAssignment;
import com.example.demo.entity.ProjectReport;
import com.example.demo.entity.Salary;
import com.example.demo.entity.enums.Role;
import com.example.demo.entity.enums.LeaveRequestStatus;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.repository.ProjectAssignmentRepository;
import com.example.demo.repository.ProjectReportRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.SalaryRepository;
import com.example.demo.service.EmployeeService;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.time.format.DateTimeParseException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectReportRepository projectReportRepository;
    private final SalaryRepository salaryRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(
        EmployeeRepository employeeRepository,
        DepartmentRepository departmentRepository,
        LeaveRequestRepository leaveRequestRepository,
        ProjectAssignmentRepository projectAssignmentRepository,
        ProjectRepository projectRepository,
        ProjectReportRepository projectReportRepository,
        SalaryRepository salaryRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.projectRepository = projectRepository;
        this.projectReportRepository = projectReportRepository;
        this.salaryRepository = salaryRepository;
        this.passwordEncoder = passwordEncoder;
    }

   @Override
    public Employee createEmployee(CreateEmployeeDTO request) {
        Department department = departmentRepository.findById(request.departmentId())
            .orElseThrow(() -> new EntityNotFoundException("Department not found: " + request.departmentId()));

        Employee employee = new Employee();
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setPasswordHash(passwordEncoder.encode(request.password()));
        employee.setRole(Role.EMPLOYEE);
        employee.setDepartment(department);
        employee.setSkills(request.skills());
        
        employee.setIsApproved(Boolean.TRUE); 

        return employeeRepository.save(employee);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));

        employee.getProjects().clear();
        employeeRepository.save(employee);

        projectAssignmentRepository.deleteByEmployeeId(id);
        projectReportRepository.deleteByEmployeeId(id);
        leaveRequestRepository.deleteByEmployeeId(id);
        salaryRepository.deleteByEmployeeId(id);

        employeeRepository.delete(employee);
    }

    @Override
    public Employee registerEmployee(RegisterEmployeeDTO request) {
        String fullName = request.fullName() == null ? "" : request.fullName().trim();
        int lastSpaceIndex = fullName.lastIndexOf(' ');
        if (lastSpaceIndex <= 0 || lastSpaceIndex == fullName.length() - 1) {
            throw new IllegalArgumentException("fullName must include at least first and last name");
        }

        String firstName = fullName.substring(0, lastSpaceIndex).trim();
        String lastName = fullName.substring(lastSpaceIndex + 1).trim();
        Department department = departmentRepository.findByName(request.department())
            .orElseThrow(() -> new EntityNotFoundException("Department not found: " + request.department()));

        Employee employee = new Employee();
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setEmail(request.email());
        employee.setPasswordHash(passwordEncoder.encode(request.password()));
        employee.setRole(request.role() != null ? request.role() : Role.EMPLOYEE);
        employee.setDepartment(department);
        employee.setIsApproved(Boolean.TRUE);

        return employeeRepository.save(employee);
    }
    
    @Override
    public Salary assignSalary(AssignSalaryDTO request) {
        Employee employee = employeeRepository.findById(request.employeeId())
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + request.employeeId()));

        BigDecimal amount = request.amount();
        if (amount == null) {
            throw new IllegalArgumentException("amount must not be null");
        }

        LocalDate effectiveDate = resolveEffectiveDate(request);
        if (effectiveDate == null) {
            throw new IllegalArgumentException("effectiveDate (or transactionTime) must not be null");
        }

        Salary salary = new Salary();
        salary.setEmployee(employee);
        salary.setAmount(amount);
        salary.setEffectiveDate(effectiveDate);

        employee.setSalary(amount);
        employeeRepository.save(employee);

        return salaryRepository.save(salary);
    }

    private LocalDate resolveEffectiveDate(AssignSalaryDTO request) {
        if (request.effectiveDate() != null) {
            return request.effectiveDate();
        }

        String transactionTime = request.transactionTime();
        if (transactionTime == null || transactionTime.isBlank()) {
            return null;
        }

        String rawValue = transactionTime.trim();
        try {
            return LocalDate.parse(rawValue);
        } catch (DateTimeParseException ignored) {
            // Try datetime variants that frontend clients commonly send.
        }

        try {
            return LocalDateTime.parse(rawValue).toLocalDate();
        } catch (DateTimeParseException ignored) {
            // Try offset datetime next.
        }

        try {
            return OffsetDateTime.parse(rawValue).toLocalDate();
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid transactionTime format: " + rawValue, ex);
        }
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findByRoleNot(Role.ADMIN);
    }

    @Override
    public EmployeeProfileDTO getMyProfile(String email) {
        Employee employee = employeeRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + email));

        String departmentName = employee.getDepartment() != null ? employee.getDepartment().getName() : null;
        return new EmployeeProfileDTO(
            employee.getFirstName(),
            employee.getLastName(),
            employee.getEmail(),
            employee.getRole().name(),
            departmentName
        );
    }

    @Override
    public List<EmployeeProjectDTO> getMyProjects(String email) {
        List<ProjectAssignment> assignments = projectAssignmentRepository.findByEmployeeEmail(email);

        return assignments.stream()
            .map(ProjectAssignment::getProject)
            .filter(project -> project != null)
            .map(project -> new EmployeeProjectDTO(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStartDate(),
                project.getEndDate()
            ))
            .toList();
    }

    @Override
    public List<Salary> getMySalaryDetails(String email) {
        return salaryRepository.findByEmployeeEmail(email);
    }

    @Override
    public LeaveRequest submitLeaveRequest(String email, SubmitLeaveRequestDTO request) {
        Employee employee = employeeRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + email));

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setStartDate(request.startDate());
        leaveRequest.setEndDate(request.endDate());
        leaveRequest.setReason(request.reason());
        leaveRequest.setStatus(LeaveRequestStatus.PENDING);

        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public List<LeaveRequest> getMyLeaveHistory(String email) {
        return leaveRequestRepository.findByEmployeeEmail(email);
    }

    @Override
    public List<ProjectReport> getAllReports() {
        return projectReportRepository.findAll();
    }

    @Override
    public ProjectReport submitProjectReport(Long employeeId, Long projectId, String reportText) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + employeeId));
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));

        ProjectReport projectReport = new ProjectReport();
        projectReport.setEmployee(employee);
        projectReport.setProject(project);
        projectReport.setReportText(reportText);

        return projectReportRepository.save(projectReport);
    }
}