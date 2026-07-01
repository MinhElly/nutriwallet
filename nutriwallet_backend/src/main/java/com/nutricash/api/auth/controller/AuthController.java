package com.nutricash.api.auth.controller;

import com.nutricash.api.auth.dto.AuthResponse;
import com.nutricash.api.auth.dto.GoogleLoginRequest;
import com.nutricash.api.auth.dto.FacebookLoginRequest;
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
            summary = "Login with Google",
            description = "Verifies the Google ID token and returns a JWT access token for NutriWallet."
    )
    @PostMapping("/google")
    public ApiResponse<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.loginWithGoogle(request);
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie(auth.accessToken(), 86400).toString());
        return ApiResponse.success(auth);
    }

    @Operation(
            summary = "Login with Facebook",
            description = "Verifies the Facebook access token and returns a JWT access token for NutriWallet."
    )
    @PostMapping("/facebook")
    public ApiResponse<AuthResponse> loginWithFacebook(@Valid @RequestBody FacebookLoginRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.loginWithFacebook(request);
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

