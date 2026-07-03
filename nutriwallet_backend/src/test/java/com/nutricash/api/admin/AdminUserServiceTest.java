package com.nutricash.api.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nutricash.api.admin.dto.AdminUserResponse;
import com.nutricash.api.admin.service.AdminAuditLogService;
import com.nutricash.api.admin.service.AdminUserService;
import com.nutricash.api.common.dto.PageResponse;
import com.nutricash.api.common.enums.AuthProvider;
import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.ChatbotPlatform;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminAuditLogService auditLogService;

    private AdminUserService service;
    private SecurityUser actor;
    private User target;

    @BeforeEach
    void setUp() {
        service = new AdminUserService(userRepository, auditLogService);
        User admin = user(1L, UserRole.ADMIN, UserStatus.ACTIVE);
        actor = new SecurityUser(admin);
        target = user(2L, UserRole.USER, UserStatus.ACTIVE);
        org.mockito.Mockito.lenient().when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void findUsersReturnsPageMetadata() {
        when(userRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(target)));

        PageResponse<AdminUserResponse> result = service.findUsers("user", UserStatus.ACTIVE, 0, 20);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().getFirst().id()).isEqualTo(2L);
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    void updateStatusPersistsAndAudits() {
        when(userRepository.findByIdAndDeletedAtIsNull(2L)).thenReturn(Optional.of(target));

        AdminUserResponse result = service.updateStatus(actor, 2L, UserStatus.BLOCKED);

        assertThat(result.status()).isEqualTo(UserStatus.BLOCKED);
        verify(auditLogService).record(1L, 2L, "USER_STATUS_CHANGED", "ACTIVE -> BLOCKED");
    }

    @Test
    void adminCannotChangeOwnStatus() {
        assertThatThrownBy(() -> service.updateStatus(actor, 1L, UserStatus.BLOCKED))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("own account status");
    }



    @Test
    void findByIdIncludesMessengerLink() {
        ChatbotProfile profile = ChatbotProfile.builder()
                .platform(ChatbotPlatform.MESSENGER)
                .linkedAt(Instant.now())
                .build();
        target.getChatbotProfiles().add(profile);
        when(userRepository.findByIdAndDeletedAtIsNull(2L)).thenReturn(Optional.of(target));

        AdminUserResponse result = service.findById(2L);

        assertThat(result.messengerLinked()).isTrue();
        assertThat(result.messengerPlatform()).isEqualTo("MESSENGER");
        assertThat(result.messengerLinkedAt()).isNotNull();
    }
    private User user(Long id, UserRole role, UserStatus status) {
        User user = User.builder()
                .id(id)
                .fullName("User " + id)
                .email("user" + id + "@example.com")
                .role(role)
                .status(status)
                .provider(AuthProvider.LOCAL)
                .build();
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        return user;
    }
}