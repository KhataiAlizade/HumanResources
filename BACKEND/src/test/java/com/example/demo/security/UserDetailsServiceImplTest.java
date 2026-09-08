package com.example.demo.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.example.demo.entity.Employee;
import com.example.demo.entity.enums.Role;
import com.example.demo.repository.EmployeeRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsernameMapsEmployeeToUserDetails() {
        Employee employee = new Employee();
        employee.setEmail("jane@example.com");
        employee.setPasswordHash("encoded-secret");
        employee.setRole(Role.ADMIN);

        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(employee));

        UserDetails userDetails = userDetailsService.loadUserByUsername("jane@example.com");

        assertEquals("jane@example.com", userDetails.getUsername());
        assertEquals("encoded-secret", userDetails.getPassword());
        assertEquals("ROLE_ADMIN", userDetails.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void loadUserByUsernameThrowsWhenMissing() {
        when(employeeRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userDetailsService.loadUserByUsername("missing@example.com"));
    }
}