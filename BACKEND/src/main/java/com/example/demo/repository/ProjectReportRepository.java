package com.example.demo.repository;

import com.example.demo.entity.ProjectReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectReportRepository extends JpaRepository<ProjectReport, Long> {

    List<ProjectReport> findByEmployeeId(Long employeeId);

    void deleteByEmployeeId(Long employeeId);

    void deleteByProjectId(Long projectId);
}