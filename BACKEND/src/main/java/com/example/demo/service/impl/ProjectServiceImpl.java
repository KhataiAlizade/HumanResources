package com.example.demo.service.impl;

import com.example.demo.dto.AssignProjectDTO;
import com.example.demo.dto.CreateProjectDTO;
import com.example.demo.entity.Employee;
import com.example.demo.entity.ProjectAssignment;
import com.example.demo.entity.Project;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.ProjectAssignmentRepository;
import com.example.demo.repository.ProjectReportRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.service.ProjectService;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final ProjectReportRepository projectReportRepository;

    public ProjectServiceImpl(
        EmployeeRepository employeeRepository,
        ProjectRepository projectRepository,
        ProjectAssignmentRepository projectAssignmentRepository,
        ProjectReportRepository projectReportRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.projectReportRepository = projectReportRepository;
    }

    @Override
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    public Project createProject(CreateProjectDTO request) {
        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        return projectRepository.save(project);
    }

    @Override
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + id));

        for (Employee employee : project.getEmployees()) {
            employee.getProjects().remove(project);
            employeeRepository.save(employee);
        }

        projectAssignmentRepository.deleteByProjectId(id);
        projectReportRepository.deleteByProjectId(id);
        projectRepository.delete(project);
    }

    @Override
    public ProjectAssignment assignProject(AssignProjectDTO request) {
        Employee employee = employeeRepository.findById(request.employeeId())
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + request.employeeId()));
        Project project = projectRepository.findById(request.projectId())
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + request.projectId()));

        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setEmployee(employee);
        assignment.setProject(project);
        assignment.setAssignedDate(LocalDate.now());

        employee.getProjects().add(project);
        employeeRepository.save(employee);

        return projectAssignmentRepository.save(assignment);
    }

    @Override
    public List<ProjectAssignment> getMyProjects(String email) {
        return projectAssignmentRepository.findByEmployeeEmail(email);
    }
}