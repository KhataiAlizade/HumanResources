package com.example.demo.security;

import com.example.demo.entity.Employee;
import com.example.demo.repository.EmployeeRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public UserDetailsServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("Employee not found: " + username));

        return new User(
            employee.getEmail(),
            employee.getPasswordHash(),
            List.of(new SimpleGrantedAuthority("ROLE_" + employee.getRole().name()))
        );
    }
}