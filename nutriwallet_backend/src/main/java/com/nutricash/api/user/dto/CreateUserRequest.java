package com.nutricash.api.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
    @NotBlank String fullName,
    @Email String email,
    @NotBlank String password
) {
    
}
