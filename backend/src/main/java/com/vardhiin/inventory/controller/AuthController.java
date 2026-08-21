package com.vardhiin.inventory.controller;

import com.vardhiin.inventory.dto.ChangePasswordRequest;
import com.vardhiin.inventory.dto.LoginRequest;
import com.vardhiin.inventory.dto.LoginResponse;
import com.vardhiin.inventory.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                Authentication auth) {
        authService.changePassword(auth.getName(), request);
        return ResponseEntity.noContent().build();
    }
}
