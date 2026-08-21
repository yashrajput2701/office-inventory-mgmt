package com.vardhiin.inventory.dto;

import com.vardhiin.inventory.entity.User;
import com.vardhiin.inventory.enums.Role;
import lombok.Getter;

@Getter
public class UserResponse {
    private final Long id;
    private final String username;
    private final String fullName;
    private final String email;
    private final Role role;

    public UserResponse(User u) {
        this.id = u.getId();
        this.username = u.getUsername();
        this.fullName = u.getFullName();
        this.email = u.getEmail();
        this.role = u.getRole();
    }
}
