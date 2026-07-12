package com.example.demo.dto;

import java.math.BigDecimal;

public record SalaryUpdateRequestDTO(Long employeeId, BigDecimal salary) {
}