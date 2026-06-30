package com.nutricash.api.security;

import com.nutricash.api.auth.service.RevokedTokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final RevokedTokenService revokedTokenService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService, RevokedTokenService revokedTokenService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.revokedTokenService = revokedTokenService;
    }

    private String resolveToken(HttpServletRequest request) {
        if (request.getCookies() != null) for (Cookie cookie : request.getCookies())
            if ("access_token".equals(cookie.getName())) return cookie.getValue();
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) return authorization.substring(7);
        return null;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token = resolveToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            if (revokedTokenService.isRevoked(token)) {
                filterChain.doFilter(request, response);
                return;
            }
            String email = jwtService.extractEmail(token);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                if (userDetails instanceof SecurityUser securityUser && jwtService.isTokenValid(token, securityUser)
                        && jwtService.tokenHash(token).equals(securityUser.getUser().getSessionTokenHash())) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (RuntimeException ignored) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}



