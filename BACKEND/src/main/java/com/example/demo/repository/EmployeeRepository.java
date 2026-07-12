package com.example.demo.repository;

import com.example.demo.entity.Employee;
import com.example.demo.entity.enums.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    List<Employee> findByIsApprovedFalse();

    List<Employee> findByRoleNot(Role role);

    long count();
}