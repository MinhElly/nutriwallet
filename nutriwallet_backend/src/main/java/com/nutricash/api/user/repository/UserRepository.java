package com.nutricash.api.user.repository;

import com.nutricash.api.user.entity.User;
import java.util.List;
import java.util.Optional;
import java.time.Instant;
import com.nutricash.api.common.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByProviderAndProviderId(com.nutricash.api.common.enums.AuthProvider provider, String providerId);

    Optional<User> findByIdAndDeletedAtIsNull(Long id);

    List<User> findAllByDeletedAtIsNull();

    boolean existsByEmailIgnoreCase(String email);

    long countByStatusAndDeletedAtIsNull(UserStatus status);

    long countByCreatedAtBetweenAndDeletedAtIsNull(Instant start, Instant end);
}