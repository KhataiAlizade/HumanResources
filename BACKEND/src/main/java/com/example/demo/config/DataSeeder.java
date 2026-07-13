package com.example.demo.config;

import com.example.demo.entity.Employee;
import com.example.demo.entity.enums.Role;
import com.example.demo.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String ADMIN_EMAIL = "admin@hrms.com";
    private static final String ADMIN_PASSWORD = "admin123";

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (employeeRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
            log.info("Default admin already exists: {}", ADMIN_EMAIL);
            return;
        }

        Employee admin = new Employee();
        admin.setFirstName("System");
        admin.setLastName("Admin");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole(Role.ADMIN);
        admin.setIsApproved(Boolean.TRUE);

        employeeRepository.save(admin);
        log.info("Created default admin account: {}", ADMIN_EMAIL);
    }
}