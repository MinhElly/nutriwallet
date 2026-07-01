package com.nutricash.api.messenger.repository;

import com.nutricash.api.messenger.entity.ChatbotMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatbotMessageRepository extends JpaRepository<ChatbotMessage, Long> {
    List<ChatbotMessage> findAllByChatbotProfileIdOrderByCreatedAtDesc(Long chatbotProfileId);
}
