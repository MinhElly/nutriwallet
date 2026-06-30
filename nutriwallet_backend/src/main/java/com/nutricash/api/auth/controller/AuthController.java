package com.nutricash.api.auth.controller;

import com.nutricash.api.auth.dto.AuthResponse;
import com.nutricash.api.auth.dto.LoginRequest;
import com.nutricash.api.auth.dto.RegisterRequest;
import com.nutricash.api.auth.service.AuthService;
import com.nutricash.api.auth.service.RevokedTokenService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
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
    private final RevokedTokenService revokedTokenService;

    public AuthController(AuthService authService, RevokedTokenService revokedTokenService) {
        this.authService = authService;
        this.revokedTokenService = revokedTokenService;
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
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.login(request);
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie(auth.accessToken(), 86400).toString());
        return ApiResponse.success(auth);
    }

    @Operation(summary = "Logout", description = "Revokes the current Bearer token immediately.")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@AuthenticationPrincipal SecurityUser currentUser, HttpServletRequest request, HttpServletResponse response) {
        String token = resolveToken(request);
        revokedTokenService.revoke(token);
        authService.logout(currentUser);
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie("", 0).toString());
        return ApiResponse.success("Logged out successfully.", null);
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
    private ResponseCookie sessionCookie(String value, long maxAge) { return ResponseCookie.from("access_token", value).httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(maxAge).build(); }
    private String resolveToken(HttpServletRequest request) { String header=request.getHeader("Authorization"); if(header!=null&&header.startsWith("Bearer "))return header.substring(7); if(request.getCookies()!=null)for(Cookie cookie:request.getCookies())if("access_token".equals(cookie.getName()))return cookie.getValue(); throw new IllegalArgumentException("Missing access token"); }
}

