package com.vardhiin.inventory.controller;

import com.vardhiin.inventory.dto.UserResponse;
import com.vardhiin.inventory.exception.ApiException;
import com.vardhiin.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        var user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(new UserResponse(user));
    }
}
