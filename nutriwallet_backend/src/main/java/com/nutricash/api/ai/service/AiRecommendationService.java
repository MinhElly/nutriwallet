package com.nutricash.api.ai.service;

import com.nutricash.api.ai.entity.AiRecommendation;
import com.nutricash.api.ai.repository.AiRecommendationRepository;
import com.nutricash.api.user.entity.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private final AiRecommendationRepository aiRecommendationRepository;

    @Transactional
    public List<AiRecommendation> getRecommendations(User user) {
        List<AiRecommendation> list = aiRecommendationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (list.isEmpty()) {
            // Seed default/initial recommendations
            List<AiRecommendation> defaults = List.of(
                    AiRecommendation.builder()
                            .user(user)
                            .content("Bạn đang chi 30% ngân sách cho trà sữa. Cân nhắc giảm xuống 2 lần/tuần.")
                            .type("budget")
                            .tone("warning")
                            .build(),
                    AiRecommendation.builder()
                            .user(user)
                            .content("Hôm nay thiếu protein 15%. Thêm thịt hoặc đậu vào bữa tối nhé.")
                            .type("nutrition")
                            .tone("caution")
                            .build(),
                    AiRecommendation.builder()
                            .user(user)
                            .content("Tuyệt vời! Uống đủ nước và đạt streak 12 ngày liên tiếp.")
                            .type("positive")
                            .tone("success")
                            .build(),
                    AiRecommendation.builder()
                            .user(user)
                            .content("Bữa trưa tối ưu: gỏi cuốn + nước dừa (180 kcal, 30k).")
                            .type("suggestion")
                            .tone("info")
                            .build()
            );
            return aiRecommendationRepository.saveAll(defaults);
        }
        return list;
    }
}
