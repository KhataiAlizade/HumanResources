package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssignSalaryDTO(
	Long employeeId,
	BigDecimal amount,
	LocalDate effectiveDate,
	String transactionTime
) {
}