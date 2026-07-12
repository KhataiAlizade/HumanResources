package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.AssignProjectDTO;
import com.example.demo.dto.CreateProjectDTO;
import com.example.demo.entity.ProjectAssignment;
import com.example.demo.entity.Project;

public interface ProjectService {

    Project createProject(CreateProjectDTO request);

    void deleteProject(Long id);

    List<Project> getAllProjects();

    ProjectAssignment assignProject(AssignProjectDTO request);

    List<ProjectAssignment> getMyProjects(String email);
}