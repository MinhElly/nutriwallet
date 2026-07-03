package com.nutricash.api.messenger.repository;
import com.nutricash.api.common.enums.ChatbotActionStatus;
import com.nutricash.api.messenger.entity.ChatbotPendingAction;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface ChatbotPendingActionRepository extends JpaRepository<ChatbotPendingAction,Long> {
 boolean existsByMessageId(String messageId);
 Optional<ChatbotPendingAction> findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(Long profileId,Collection<ChatbotActionStatus> statuses);
}
