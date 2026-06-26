package com.nutricash.api.ai.service;

import com.nutricash.api.ai.dto.AiAnalyzeMealRequest;
import com.nutricash.api.ai.dto.AiAnalyzeMealResponse;
import com.nutricash.api.ai.entity.AiAnalysisLog;
import com.nutricash.api.ai.repository.AiAnalysisLogRepository;
import com.nutricash.api.common.enums.AiAnalysisStatus;
import com.nutricash.api.common.enums.AiInputType;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final AiAnalysisLogRepository aiAnalysisLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public AiAnalyzeMealResponse analyzeMeal(SecurityUser currentUser, AiAnalyzeMealRequest request) {
        User user = getCurrentUser(currentUser);
        AiInputType inputType = resolveInputType(request);
        BigDecimal calories = valueOrZero(request.estimatedCalories());
        BigDecimal protein = valueOrZero(request.estimatedProteinGram());
        BigDecimal carb = valueOrZero(request.estimatedCarbGram());
        BigDecimal fat = valueOrZero(request.estimatedFatGram());
        String rawResponse = "Temporary estimate response. Connect Gemini/OpenAI client later for real analysis.";

        AiAnalysisLog log = AiAnalysisLog.builder()
                .user(user)
                .inputType(inputType)
                .inputText(request.text())
                .inputImageUrl(request.imageUrl())
                .rawAiResponse(rawResponse)
                .parsedCalories(calories)
                .parsedProteinGram(protein)
                .parsedCarbGram(carb)
                .parsedFatGram(fat)
                .modelName("manual-estimate")
                .status(AiAnalysisStatus.SUCCESS)
                .build();
        AiAnalysisLog saved = aiAnalysisLogRepository.save(log);
        return new AiAnalyzeMealResponse(saved.getId(), calories, protein, carb, fat, saved.getModelName(), rawResponse);
    }

    private AiInputType resolveInputType(AiAnalyzeMealRequest request) {
        boolean hasText = request.text() != null && !request.text().isBlank();
        boolean hasImage = request.imageUrl() != null && !request.imageUrl().isBlank();
        if (hasText && hasImage) return AiInputType.IMAGE_AND_TEXT;
        if (hasImage) return AiInputType.IMAGE;
        return AiInputType.TEXT;
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private User getCurrentUser(SecurityUser currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        return userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}