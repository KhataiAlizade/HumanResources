package com.example.demo.repository;

import com.example.demo.entity.ProjectAssignment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {

	List<ProjectAssignment> findByEmployeeEmail(String email);

	void deleteByEmployeeId(Long employeeId);

	void deleteByProjectId(Long projectId);
}