package com.example.demo.repository;

import com.example.demo.entity.Salary;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

	List<Salary> findByEmployeeEmail(String email);

	List<Salary> findByEmployeeId(Long employeeId);

	void deleteByEmployeeId(Long employeeId);
}