package com.nutricash.api.auth.controller;

import com.nutricash.api.auth.dto.AuthResponse;
import com.nutricash.api.auth.dto.LoginRequest;
import com.nutricash.api.auth.dto.RegisterRequest;
import com.nutricash.api.auth.service.AuthService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for account registration, email verification, login and current user session")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(
            summary = "Register a new account",
            description = "Creates a local user account with PENDING_VERIFICATION status, generates an email verification token, and sends a verification email. The account must be verified before login."
    )
    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ApiResponse.success("Registration successful. Please check your email to verify your account.", null);
    }

    @Operation(
            summary = "Verify account email",
            description = "Verifies a user account by the token sent to email. If the token is valid and not expired, the user status changes to ACTIVE."
    )
    @GetMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ApiResponse.success("Email verified successfully.", null);
    }

    @Operation(
            summary = "Login with email and password",
            description = "Authenticates an ACTIVE local user. Returns a Bearer JWT access token and the logged-in user's profile."
    )
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @Operation(
            summary = "Get current authenticated user",
            description = "Returns the profile of the user linked to the Bearer JWT in the Authorization header. Use this to restore the logged-in session on app reload.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal SecurityUser currentUser) {
        return ApiResponse.success(authService.getMe(currentUser));
    }
}