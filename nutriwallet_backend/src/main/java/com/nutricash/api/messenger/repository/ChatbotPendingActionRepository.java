package com.nutricash.api.messenger.repository;
import com.nutricash.api.common.enums.ChatbotActionStatus;
import com.nutricash.api.messenger.entity.ChatbotPendingAction;
import org.springframework.data.jpa.repository.*;
import java.util.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;
public interface ChatbotPendingActionRepository extends JpaRepository<ChatbotPendingAction,Long> {
 boolean existsByMessageId(String messageId);
 Optional<ChatbotPendingAction> findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(Long profileId,Collection<ChatbotActionStatus> statuses);
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select a from ChatbotPendingAction a join fetch a.chatbotProfile p left join fetch p.user where a.id=:id")
 Optional<ChatbotPendingAction> findByIdForUpdate(@Param("id") Long id);
}
