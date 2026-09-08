package com.example.demo.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void generateTokenAndExtractUsername() {
        UserDetails userDetails = userDetails("jane@example.com");

        String token = jwtService.generateToken(userDetails);

        assertEquals("jane@example.com", jwtService.extractUsername(token));
    }

    @Test
    void isTokenValidReturnsTrueForMatchingUser() {
        UserDetails userDetails = userDetails("jane@example.com");
        String token = jwtService.generateToken(userDetails);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValidReturnsFalseForDifferentUser() {
        UserDetails tokenUser = userDetails("jane@example.com");
        UserDetails otherUser = userDetails("other@example.com");
        String token = jwtService.generateToken(tokenUser);

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    private UserDetails userDetails(String username) {
        return new User(username, "password", List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
    }
}