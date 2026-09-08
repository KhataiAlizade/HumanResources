package com.example.demo.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.demo.dto.AssignSalaryDTO;
import com.example.demo.dto.CreateEmployeeDTO;
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
import com.example.demo.entity.enums.LeaveRequestStatus;
import com.example.demo.entity.enums.Role;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.repository.ProjectAssignmentRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.ProjectReportRepository;
import com.example.demo.repository.SalaryRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private ProjectAssignmentRepository projectAssignmentRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectReportRepository projectReportRepository;

    @Mock
    private SalaryRepository salaryRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    @Test
    void createEmployeeCreatesApprovedEmployeeWithEncodedPassword() {
        Department department = department(7L, "Engineering");
        CreateEmployeeDTO request = new CreateEmployeeDTO("Jane", "Doe", "jane@example.com", "secret", 7L, "Java");

        when(departmentRepository.findById(7L)).thenReturn(Optional.of(department));
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Employee saved = employeeService.createEmployee(request);

        assertEquals("Jane", saved.getFirstName());
        assertEquals("Doe", saved.getLastName());
        assertEquals("jane@example.com", saved.getEmail());
        assertEquals("encoded-secret", saved.getPasswordHash());
        assertEquals(Role.EMPLOYEE, saved.getRole());
        assertEquals(Boolean.TRUE, saved.getIsApproved());
        assertEquals(department, saved.getDepartment());
        assertEquals("Java", saved.getSkills());

        verify(departmentRepository).findById(7L);
        verify(passwordEncoder).encode("secret");
        verify(employeeRepository).save(saved);
    }

    @Test
    void createEmployeeThrowsWhenDepartmentMissing() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class,
            () -> employeeService.createEmployee(new CreateEmployeeDTO("Jane", "Doe", "jane@example.com", "secret", 99L, "Java")));

        verify(departmentRepository).findById(99L);
        verify(passwordEncoder, never()).encode(any());
        verify(employeeRepository, never()).save(any());
    }

    @Test
    void registerEmployeeSplitsFullNameAndDefaultsRole() {
        Department department = department(2L, "Operations");
        RegisterEmployeeDTO request = new RegisterEmployeeDTO("Jane Marie Doe", "jane@example.com", "secret", null, "Operations");

        when(departmentRepository.findByName("Operations")).thenReturn(Optional.of(department));
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Employee saved = employeeService.registerEmployee(request);

        assertEquals("Jane Marie", saved.getFirstName());
        assertEquals("Doe", saved.getLastName());
        assertEquals(Role.EMPLOYEE, saved.getRole());
        assertEquals(Boolean.TRUE, saved.getIsApproved());
        assertEquals("encoded-secret", saved.getPasswordHash());
        assertEquals(department, saved.getDepartment());

        verify(departmentRepository).findByName("Operations");
        verify(passwordEncoder).encode("secret");
        verify(employeeRepository).save(saved);
    }

    @Test
    void registerEmployeeRejectsInvalidFullName() {
        assertThrows(IllegalArgumentException.class,
            () -> employeeService.registerEmployee(new RegisterEmployeeDTO("Jane", "jane@example.com", "secret", Role.ADMIN, "Operations")));

        verify(departmentRepository, never()).findByName(any());
        verify(employeeRepository, never()).save(any());
    }

    @Test
    void registerEmployeeThrowsWhenDepartmentMissing() {
        when(departmentRepository.findByName("Operations")).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class,
            () -> employeeService.registerEmployee(new RegisterEmployeeDTO("Jane Doe", "jane@example.com", "secret", Role.ADMIN, "Operations")));

        verify(departmentRepository).findByName("Operations");
        verify(passwordEncoder, never()).encode(any());
        verify(employeeRepository, never()).save(any());
    }

    @Test
    void assignSalaryUsesExplicitEffectiveDateAndPersistsEmployeeAndSalary() {
        Employee employee = employee(10L, "jane@example.com");
        AssignSalaryDTO request = new AssignSalaryDTO(10L, new BigDecimal("4500.00"), LocalDate.of(2026, 2, 1), null);

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(salaryRepository.save(any(Salary.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Salary saved = employeeService.assignSalary(request);

        assertEquals(new BigDecimal("4500.00"), employee.getSalary());
        assertEquals(employee, saved.getEmployee());
        assertEquals(new BigDecimal("4500.00"), saved.getAmount());
        assertEquals(LocalDate.of(2026, 2, 1), saved.getEffectiveDate());

        verify(employeeRepository).save(employee);
        verify(salaryRepository).save(saved);
    }

    @Test
    void assignSalaryParsesTransactionTimeToEffectiveDate() {
        Employee employee = employee(11L, "jane@example.com");
        AssignSalaryDTO request = new AssignSalaryDTO(11L, new BigDecimal("5100.00"), null, "2026-03-15T08:30:00");

        when(employeeRepository.findById(11L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(salaryRepository.save(any(Salary.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Salary saved = employeeService.assignSalary(request);

        assertEquals(LocalDate.of(2026, 3, 15), saved.getEffectiveDate());
        assertEquals(new BigDecimal("5100.00"), employee.getSalary());
    }

    @Test
    void assignSalaryRejectsNullAmount() {
        when(employeeRepository.findById(12L)).thenReturn(Optional.of(employee(12L, "jane@example.com")));

        assertThrows(IllegalArgumentException.class,
            () -> employeeService.assignSalary(new AssignSalaryDTO(12L, null, LocalDate.of(2026, 1, 1), null)));

        verify(employeeRepository).findById(12L);
        verify(employeeRepository, never()).save(any());
        verify(salaryRepository, never()).save(any());
    }

    @Test
    void assignSalaryRejectsInvalidTransactionTime() {
        when(employeeRepository.findById(13L)).thenReturn(Optional.of(employee(13L, "jane@example.com")));

        assertThrows(IllegalArgumentException.class,
            () -> employeeService.assignSalary(new AssignSalaryDTO(13L, new BigDecimal("1000.00"), null, "not-a-date")));

        verify(employeeRepository).findById(13L);
        verify(employeeRepository, never()).save(any());
        verify(salaryRepository, never()).save(any());
    }

    @Test
    void assignSalaryThrowsWhenEmployeeMissing() {
        when(employeeRepository.findById(14L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class,
            () -> employeeService.assignSalary(new AssignSalaryDTO(14L, new BigDecimal("1000.00"), LocalDate.of(2026, 1, 1), null)));

        verify(employeeRepository).findById(14L);
        verify(employeeRepository, never()).save(any());
        verify(salaryRepository, never()).save(any());
    }

    @Test
    void getMyProfileReturnsDepartmentNameWhenPresent() {
        Department department = department(3L, "Finance");
        Employee employee = employee(15L, "jane@example.com");
        employee.setFirstName("Jane");
        employee.setLastName("Doe");
        employee.setRole(Role.ADMIN);
        employee.setDepartment(department);

        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(employee));

        EmployeeProfileDTO profile = employeeService.getMyProfile("jane@example.com");

        assertEquals("Jane", profile.name());
        assertEquals("Doe", profile.surname());
        assertEquals("jane@example.com", profile.email());
        assertEquals("ADMIN", profile.role());
        assertEquals("Finance", profile.department());
    }

    @Test
    void getMyProfileReturnsNullDepartmentWhenAbsent() {
        Employee employee = employee(16L, "jane@example.com");
        employee.setFirstName("Jane");
        employee.setLastName("Doe");
        employee.setRole(Role.EMPLOYEE);

        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(employee));

        EmployeeProfileDTO profile = employeeService.getMyProfile("jane@example.com");

        assertNull(profile.department());
    }

    @Test
    void getMyProjectsFiltersNullAssignmentsAndMapsProjects() {
        Project project = project(21L, "Payroll Modernization");
        ProjectAssignment withProject = new ProjectAssignment();
        withProject.setProject(project);
        ProjectAssignment withNullProject = new ProjectAssignment();
        withNullProject.setProject(null);

        when(projectAssignmentRepository.findByEmployeeEmail("jane@example.com")).thenReturn(List.of(withProject, withNullProject));

        List<com.example.demo.dto.EmployeeProjectDTO> projects = employeeService.getMyProjects("jane@example.com");

        assertEquals(1, projects.size());
        assertEquals(21L, projects.get(0).projectId());
        assertEquals("Payroll Modernization", projects.get(0).name());
    }

    @Test
    void getMySalaryDetailsDelegatesToRepository() {
        List<Salary> salaries = List.of(salary(1L, employee(17L, "jane@example.com"), new BigDecimal("1000.00"), LocalDate.of(2026, 1, 1)));
        when(salaryRepository.findByEmployeeEmail("jane@example.com")).thenReturn(salaries);

        List<Salary> result = employeeService.getMySalaryDetails("jane@example.com");

        assertEquals(salaries, result);
        verify(salaryRepository).findByEmployeeEmail("jane@example.com");
    }

    @Test
    void submitLeaveRequestCreatesPendingLeaveRequest() {
        Employee employee = employee(18L, "jane@example.com");
        SubmitLeaveRequestDTO request = new SubmitLeaveRequestDTO(LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 5), "Vacation");

        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveRequest saved = employeeService.submitLeaveRequest("jane@example.com", request);

        assertEquals(employee, saved.getEmployee());
        assertEquals(LeaveRequestStatus.PENDING, saved.getStatus());
        assertEquals(LocalDate.of(2026, 4, 1), saved.getStartDate());
        assertEquals(LocalDate.of(2026, 4, 5), saved.getEndDate());
        assertEquals("Vacation", saved.getReason());
        verify(leaveRequestRepository).save(saved);
    }

    @Test
    void submitLeaveRequestThrowsWhenEmployeeMissing() {
        when(employeeRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class,
            () -> employeeService.submitLeaveRequest("missing@example.com", new SubmitLeaveRequestDTO(LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 5), "Vacation")));

        verify(leaveRequestRepository, never()).save(any());
    }

    @Test
    void getMyLeaveHistoryDelegatesToRepository() {
        List<LeaveRequest> leaveRequests = List.of(new LeaveRequest());
        when(leaveRequestRepository.findByEmployeeEmail("jane@example.com")).thenReturn(leaveRequests);

        List<LeaveRequest> result = employeeService.getMyLeaveHistory("jane@example.com");

        assertEquals(leaveRequests, result);
        verify(leaveRequestRepository).findByEmployeeEmail("jane@example.com");
    }

    @Test
    void getAllReportsDelegatesToRepository() {
        List<ProjectReport> reports = List.of(new ProjectReport());
        when(projectReportRepository.findAll()).thenReturn(reports);

        List<ProjectReport> result = employeeService.getAllReports();

        assertEquals(reports, result);
        verify(projectReportRepository).findAll();
    }

    @Test
    void submitProjectReportCreatesReportForEmployeeAndProject() {
        Employee employee = employee(19L, "jane@example.com");
        Project project = project(22L, "HR Platform");
        when(employeeRepository.findById(19L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(22L)).thenReturn(Optional.of(project));
        when(projectReportRepository.save(any(ProjectReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectReport saved = employeeService.submitProjectReport(19L, 22L, "Weekly update");

        assertEquals(employee, saved.getEmployee());
        assertEquals(project, saved.getProject());
        assertEquals("Weekly update", saved.getReportText());
        verify(projectReportRepository).save(saved);
    }

    @Test
    void submitProjectReportThrowsWhenEmployeeMissing() {
        when(employeeRepository.findById(19L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class,
            () -> employeeService.submitProjectReport(19L, 22L, "Weekly update"));

        verify(projectRepository, never()).findById(anyLong());
        verify(projectReportRepository, never()).save(any());
    }

    @Test
    void submitProjectReportThrowsWhenProjectMissing() {
        when(employeeRepository.findById(19L)).thenReturn(Optional.of(employee(19L, "jane@example.com")));
        when(projectRepository.findById(22L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class,
            () -> employeeService.submitProjectReport(19L, 22L, "Weekly update"));

        verify(projectReportRepository, never()).save(any());
    }

    @Test
    void deleteEmployeeRemovesAllAssociationsAndDeletesEmployee() {
        Employee employee = employee(20L, "jane@example.com");
        Project project = project(23L, "HR Portal");
        employee.getProjects().add(project);

        when(employeeRepository.findById(20L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        employeeService.deleteEmployee(20L);

        assertTrue(employee.getProjects().isEmpty());
        verify(employeeRepository).save(employee);
        verify(projectAssignmentRepository).deleteByEmployeeId(20L);
        verify(projectReportRepository).deleteByEmployeeId(20L);
        verify(leaveRequestRepository).deleteByEmployeeId(20L);
        verify(salaryRepository).deleteByEmployeeId(20L);
        verify(employeeRepository).delete(employee);
    }

    @Test
    void deleteEmployeeThrowsWhenMissing() {
        when(employeeRepository.findById(21L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> employeeService.deleteEmployee(21L));

        verify(employeeRepository, never()).save(any());
        verify(employeeRepository, never()).delete(any());
    }

    @Test
    void getAllEmployeesDelegatesToRoleFilter() {
        List<Employee> employees = List.of(employee(30L, "alice@example.com"));
        when(employeeRepository.findByRoleNot(Role.ADMIN)).thenReturn(employees);

        List<Employee> result = employeeService.getAllEmployees();

        assertEquals(employees, result);
        verify(employeeRepository).findByRoleNot(Role.ADMIN);
    }

    private Employee employee(Long id, String email) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setEmail(email);
        return employee;
    }

    private Department department(Long id, String name) {
        Department department = new Department();
        department.setId(id);
        department.setName(name);
        return department;
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

    private Salary salary(Long id, Employee employee, BigDecimal amount, LocalDate date) {
        Salary salary = new Salary();
        salary.setId(id);
        salary.setEmployee(employee);
        salary.setAmount(amount);
        salary.setEffectiveDate(date);
        return salary;
    }
}