package com.nutricash.api.messenger.repository;

import com.nutricash.api.messenger.entity.ChatbotProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatbotProfileRepository extends JpaRepository<ChatbotProfile, Long> {

    Optional<ChatbotProfile> findByPsid(String psid);

    Optional<ChatbotProfile> findByGuestSessionCode(String guestSessionCode);

    List<ChatbotProfile> findAllByUserId(Long userId);
}

