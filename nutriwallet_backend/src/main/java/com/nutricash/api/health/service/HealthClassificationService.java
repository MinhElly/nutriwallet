package com.nutricash.api.health.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.health.dto.HealthClassificationResponse;
import com.nutricash.api.health.entity.*;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.repository.HealthClassificationRepository;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HealthClassificationService {
    public static final int RULE_VERSION = 1;
    private final HealthClassificationRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HealthClassification classify(HealthProfile profile) {
        List<HealthRiskFlag> flags = new ArrayList<>();
        List<HealthClassificationResponse.Explanation> explanations = new ArrayList<>();
        for (HealthProfileCondition item : profile.getConditions()) {
            HealthRiskFlag flag = switch (item.getConditionType()) {
                case DIABETES -> HealthRiskFlag.DIABETES_REPORTED;
                case HYPERTENSION -> HealthRiskFlag.HYPERTENSION_REPORTED;
                case KIDNEY_DISEASE -> HealthRiskFlag.KIDNEY_DISEASE_REPORTED;
                case CARDIOVASCULAR -> HealthRiskFlag.CARDIOVASCULAR_REPORTED;
                case OTHER -> HealthRiskFlag.OTHER_CONDITION_REPORTED;
            };
            if (!flags.contains(flag)) flags.add(flag);
            explanations.add(new HealthClassificationResponse.Explanation(
                    "CONDITION_" + item.getConditionType().name(), "SELF_REPORTED_CONDITION",
                    "Phân loại dựa trên bệnh nền do người dùng tự khai; đây không phải chẩn đoán y khoa."));
        }
        if (!profile.getAllergies().isEmpty()) {
            flags.add(HealthRiskFlag.ALLERGY_REPORTED);
            explanations.add(new HealthClassificationResponse.Explanation(
                    "ALLERGY_SELF_REPORTED", "SELF_REPORTED_ALLERGY",
                    "Cần kiểm tra thành phần món ăn theo dị ứng do người dùng tự khai."));
        }
        HealthUserType primary = !profile.getAllergies().isEmpty() ? HealthUserType.ALLERGY_SENSITIVE
                : !profile.getConditions().isEmpty() ? HealthUserType.CHRONIC_CONDITION : HealthUserType.GENERAL;
        if (explanations.isEmpty()) {
            explanations.add(new HealthClassificationResponse.Explanation(
                    "NO_REPORTED_RISK", "PROFILE", "Chưa có bệnh nền hoặc dị ứng được người dùng khai báo."));
        }
        HealthClassification classification = repository.findByHealthProfileId(profile.getId())
                .orElseGet(() -> HealthClassification.builder().healthProfile(profile).build());
        classification.setPrimaryType(primary);
        classification.setRiskFlagsJson(write(flags));
        classification.setExplanationsJson(write(explanations));
        classification.setRuleVersion(RULE_VERSION);
        classification.setEvaluatedAt(Instant.now());
        classification = repository.save(classification);
        profile.setClassification(classification);
        return classification;
    }

    public HealthClassificationResponse toResponse(HealthClassification value) {
        if (value == null) return null;
        return new HealthClassificationResponse(value.getPrimaryType(),
                read(value.getRiskFlagsJson(), new TypeReference<List<HealthRiskFlag>>() {}),
                read(value.getExplanationsJson(), new TypeReference<List<HealthClassificationResponse.Explanation>>() {}),
                value.getRuleVersion(), value.getEvaluatedAt());
    }

    private String write(Object value) {
        try { return objectMapper.writeValueAsString(value); }
        catch (Exception e) { throw new IllegalStateException("Cannot serialize health classification", e); }
    }
    private <T> T read(String value, TypeReference<T> type) {
        try { return objectMapper.readValue(value, type); }
        catch (Exception e) { throw new IllegalStateException("Cannot read health classification", e); }
    }
}
