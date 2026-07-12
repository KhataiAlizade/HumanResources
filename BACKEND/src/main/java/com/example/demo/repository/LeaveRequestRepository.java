package com.example.demo.repository;

import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.enums.LeaveRequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeEmail(String email);

    List<LeaveRequest> findByEmployeeId(Long employeeId);

    List<LeaveRequest> findByStatus(LeaveRequestStatus status);

    void deleteByEmployeeId(Long employeeId);
}