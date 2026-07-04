package com.nutricash.api.ai.service;

import com.nutricash.api.ai.dto.AiHealthWarning;
import com.nutricash.api.health.entity.*;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.repository.HealthProfileRepository;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class MealHealthWarningService {
    private static final String DISCLAIMER = "Thông tin chỉ để tham khảo, không thay thế chẩn đoán hoặc chỉ định điều trị.";
    private final HealthProfileRepository profiles;
    public List<AiHealthWarning> evaluate(User user, List<String> ingredients, List<String> allergens,
            BigDecimal sugar, BigDecimal sodium, BigDecimal carbs, BigDecimal protein) {
        HealthProfile profile = profiles.findByUserId(user.getId()).orElse(null);
        if (profile == null || !profile.isConsentGiven()) return List.of();
        List<AiHealthWarning> result = new ArrayList<>();
        Set<String> mealTerms = new LinkedHashSet<>();
        safe(ingredients).forEach(v -> mealTerms.add(norm(v)));
        safe(allergens).forEach(v -> mealTerms.add(norm(v)));
        for (HealthProfileAllergy allergy : profile.getAllergies()) {
            String expected = allergy.getAllergenType() == HealthAllergenType.OTHER ? norm(allergy.getCustomValue()) : allergenTerm(allergy.getAllergenType());
            Optional<String> match = mealTerms.stream().filter(v -> matches(v, expected)).findFirst();
            match.ifPresent(value -> result.add(warning("HIGH", "ALLERGY_MATCH_" + allergy.getAllergenType(),
                    "Thành phần có thể trùng với dị ứng bạn đã khai báo; hãy kiểm tra và xác nhận trước khi lưu.", List.of("allergy=" + expected, "meal=" + value))));
        }
        Set<HealthConditionType> conditions = new HashSet<>();
        profile.getConditions().forEach(v -> conditions.add(v.getConditionType()));
        if (conditions.contains(HealthConditionType.DIABETES)) result.add(metric("DIABETES_SUGAR_CARB", "Lưu ý lượng đường/carbohydrate ước tính.", sugar, "sugarGram", carbs, "carbGram"));
        if (conditions.contains(HealthConditionType.HYPERTENSION) || conditions.contains(HealthConditionType.CARDIOVASCULAR)) result.add(metric("SODIUM_CARDIOVASCULAR", "Lưu ý lượng sodium ước tính.", sodium, "sodiumMg", null, null));
        if (conditions.contains(HealthConditionType.KIDNEY_DISEASE)) result.add(metric("KIDNEY_PROTEIN_SODIUM", "Lưu ý lượng protein và sodium ước tính.", protein, "proteinGram", sodium, "sodiumMg"));
        return List.copyOf(result);
    }
    private AiHealthWarning metric(String rule, String message, BigDecimal first, String firstName, BigDecimal second, String secondName) {
        List<String> evidence = new ArrayList<>();
        if (first != null) evidence.add(firstName + "=" + first);
        if (second != null) evidence.add(secondName + "=" + second);
        if (evidence.isEmpty()) message += " Không đủ dữ liệu định lượng để đánh giá thêm.";
        return warning("MEDIUM", rule, message, evidence);
    }
    private AiHealthWarning warning(String severity, String rule, String message, List<String> evidence) { return new AiHealthWarning(severity, rule, message, List.copyOf(evidence), DISCLAIMER); }
    private List<String> safe(List<String> values) { return values == null ? List.of() : values; }
    private boolean matches(String value, String expected) { return expected != null && !expected.isBlank() && (value.contains(expected) || expected.contains(value)); }
    private String norm(String value) { return value == null ? "" : Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).trim(); }
    private String allergenTerm(HealthAllergenType type) {
        return switch (type) { case PEANUT -> "dau phong"; case TREE_NUT -> "hat"; case MILK -> "sua"; case EGG -> "trung"; case SEAFOOD -> "hai san"; case SOY -> "dau nanh"; case WHEAT -> "lua mi"; case SESAME -> "me"; case OTHER -> ""; };
    }
}
