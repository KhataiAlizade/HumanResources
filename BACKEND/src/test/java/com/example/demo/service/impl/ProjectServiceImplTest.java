package com.example.demo.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.demo.dto.AssignProjectDTO;
import com.example.demo.dto.CreateProjectDTO;
import com.example.demo.entity.Employee;
import com.example.demo.entity.Project;
import com.example.demo.entity.ProjectAssignment;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.ProjectAssignmentRepository;
import com.example.demo.repository.ProjectReportRepository;
import com.example.demo.repository.ProjectRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectAssignmentRepository projectAssignmentRepository;

    @Mock
    private ProjectReportRepository projectReportRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    @Test
    void createProjectMapsFieldsAndSavesProject() {
        CreateProjectDTO request = new CreateProjectDTO("Payroll", "Payroll modernization", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Project saved = projectService.createProject(request);

        assertEquals("Payroll", saved.getName());
        assertEquals("Payroll modernization", saved.getDescription());
        assertEquals(LocalDate.of(2026, 1, 1), saved.getStartDate());
        assertEquals(LocalDate.of(2026, 12, 31), saved.getEndDate());
        verify(projectRepository).save(saved);
    }

    @Test
    void getAllProjectsDelegatesToRepository() {
        List<Project> projects = List.of(project(1L, "A"));
        when(projectRepository.findAll()).thenReturn(projects);

        List<Project> result = projectService.getAllProjects();

        assertEquals(projects, result);
        verify(projectRepository).findAll();
    }

    @Test
    void assignProjectCreatesAssignmentAndUpdatesEmployeeProjects() {
        Employee employee = employee(10L, "jane@example.com");
        Project project = project(20L, "Payroll");
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(20L)).thenReturn(Optional.of(project));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(projectAssignmentRepository.save(any(ProjectAssignment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectAssignment saved = projectService.assignProject(new AssignProjectDTO(10L, 20L));

        assertEquals(employee, saved.getEmployee());
        assertEquals(project, saved.getProject());
        assertTrue(employee.getProjects().contains(project));
        assertEquals(LocalDate.now(), saved.getAssignedDate());
        verify(employeeRepository).save(employee);
        verify(projectAssignmentRepository).save(saved);
    }

    @Test
    void assignProjectThrowsWhenEmployeeMissing() {
        when(employeeRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class,
            () -> projectService.assignProject(new AssignProjectDTO(10L, 20L)));

        verify(projectRepository, never()).findById(anyLong());
        verify(projectAssignmentRepository, never()).save(any());
    }

    @Test
    void assignProjectThrowsWhenProjectMissing() {
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee(10L, "jane@example.com")));
        when(projectRepository.findById(20L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class,
            () -> projectService.assignProject(new AssignProjectDTO(10L, 20L)));

        verify(projectAssignmentRepository, never()).save(any());
    }

    @Test
    void deleteProjectRemovesProjectFromEmployeesAndDeletesAssociations() {
        Project project = project(30L, "HR Platform");
        Employee employee = employee(11L, "jane@example.com");
        employee.getProjects().add(project);
        project.getEmployees().add(employee);

        when(projectRepository.findById(30L)).thenReturn(Optional.of(project));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        projectService.deleteProject(30L);

        assertTrue(employee.getProjects().isEmpty());
        verify(employeeRepository).save(employee);
        verify(projectAssignmentRepository).deleteByProjectId(30L);
        verify(projectReportRepository).deleteByProjectId(30L);
        verify(projectRepository).delete(project);
    }

    @Test
    void deleteProjectThrowsWhenMissing() {
        when(projectRepository.findById(31L)).thenReturn(Optional.empty());

        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> projectService.deleteProject(31L));

        verify(employeeRepository, never()).save(any());
        verify(projectRepository, never()).delete(any());
    }

    @Test
    void getMyProjectsDelegatesToRepository() {
        List<ProjectAssignment> assignments = List.of(new ProjectAssignment());
        when(projectAssignmentRepository.findByEmployeeEmail("jane@example.com")).thenReturn(assignments);

        List<ProjectAssignment> result = projectService.getMyProjects("jane@example.com");

        assertEquals(assignments, result);
        verify(projectAssignmentRepository).findByEmployeeEmail("jane@example.com");
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

    private Employee employee(Long id, String email) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setEmail(email);
        return employee;
    }
}