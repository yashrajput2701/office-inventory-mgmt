package com.vardhiin.inventory.dto;

import com.vardhiin.inventory.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private String fullName;
    private Role role;
}
