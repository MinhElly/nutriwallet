package com.nutricash.api.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.ai.dto.AiHealthWarning;
import com.nutricash.api.health.entity.*;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.repository.HealthProfileRepository;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MealHealthWarningService {
    private static final String DISCLAIMER =
            "Thông tin chỉ để tham khảo, không thay thế chẩn đoán hoặc chỉ định điều trị.";

    private final HealthProfileRepository profiles;
    private final ObjectMapper mapper = new ObjectMapper();

    public List<AiHealthWarning> evaluate(User user, List<String> ingredients, List<String> allergens,
            BigDecimal sugar, BigDecimal sodium, BigDecimal carbs, BigDecimal protein) {
        return evaluate(user, null, ingredients, allergens, sugar, sodium, carbs, protein);
    }

    public List<AiHealthWarning> evaluate(User user, String foodName, List<String> ingredients,
            List<String> allergens, BigDecimal sugar, BigDecimal sodium, BigDecimal carbs,
            BigDecimal protein) {
        if (user == null) return List.of();
        HealthProfile profile = profiles.findByUserId(user.getId()).orElse(null);
        if (profile == null || !profile.isConsentGiven()) return List.of();

        List<AiHealthWarning> result = new ArrayList<>();
        Set<String> mealTerms = new LinkedHashSet<>();
        addTerm(mealTerms, foodName);
        safe(ingredients).forEach(v -> addTerm(mealTerms, v));
        safe(allergens).forEach(v -> addTerm(mealTerms, v));

        for (HealthProfileAllergy allergy : profile.getAllergies()) {
            String expected = allergy.getAllergenType() == HealthAllergenType.OTHER
                    ? norm(allergy.getCustomValue()) : allergenTerm(allergy.getAllergenType());
            match(mealTerms, expected).ifPresent(value -> result.add(warning(
                    "HIGH", "ALLERGY_MATCH_" + allergy.getAllergenType(),
                    "Cảnh báo: món ăn có thể chứa thành phần trùng với dị ứng bạn đã khai báo. "
                            + "Hãy kiểm tra kỹ thành phần trước khi sử dụng hoặc xác nhận lưu.",
                    List.of("allergy=" + expected, "meal=" + value))));
        }

        for (String restriction : restrictions(profile.getFoodRestrictions())) {
            String expected = norm(restriction);
            match(mealTerms, expected).ifPresent(value -> result.add(warning(
                    "HIGH", "FOOD_RESTRICTION_MATCH",
                    "Cảnh báo: món ăn có thể chứa thực phẩm bạn đã đặt hạn chế: “"
                            + restriction + "”. Hãy kiểm tra trước khi sử dụng.",
                    List.of("restriction=" + expected, "meal=" + value))));
        }

        Set<HealthConditionType> conditions = new HashSet<>();
        profile.getConditions().forEach(v -> conditions.add(v.getConditionType()));
        if (conditions.contains(HealthConditionType.DIABETES))
            result.add(metric("DIABETES_SUGAR_CARB",
                    "Lưu ý lượng đường/carbohydrate ước tính.", sugar, "sugarGram", carbs, "carbGram"));
        if (conditions.contains(HealthConditionType.HYPERTENSION)
                || conditions.contains(HealthConditionType.CARDIOVASCULAR))
            result.add(metric("SODIUM_CARDIOVASCULAR",
                    "Lưu ý lượng sodium ước tính.", sodium, "sodiumMg", null, null));
        if (conditions.contains(HealthConditionType.KIDNEY_DISEASE))
            result.add(metric("KIDNEY_PROTEIN_SODIUM",
                    "Lưu ý lượng protein và sodium ước tính.", protein, "proteinGram",
                    sodium, "sodiumMg"));
        return List.copyOf(result);
    }

    private void addTerm(Set<String> terms, String value) {
        String normalized = norm(value);
        if (!normalized.isBlank()) terms.add(normalized);
    }

    private Optional<String> match(Set<String> mealTerms, String expected) {
        if (expected == null || expected.isBlank()) return Optional.empty();
        return mealTerms.stream().filter(v -> matches(v, expected)).findFirst();
    }

    private List<String> restrictions(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return mapper.readValue(json, new TypeReference<List<String>>() {}).stream()
                    .filter(Objects::nonNull).map(String::trim).filter(v -> !v.isBlank()).toList();
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private AiHealthWarning metric(String rule, String message, BigDecimal first,
            String firstName, BigDecimal second, String secondName) {
        List<String> evidence = new ArrayList<>();
        if (first != null) evidence.add(firstName + "=" + first);
        if (second != null) evidence.add(secondName + "=" + second);
        if (evidence.isEmpty()) message += " Không đủ dữ liệu định lượng để đánh giá thêm.";
        return warning("MEDIUM", rule, message, evidence);
    }

    private AiHealthWarning warning(String severity, String rule, String message,
            List<String> evidence) {
        return new AiHealthWarning(severity, rule, message, List.copyOf(evidence), DISCLAIMER);
    }

    private List<String> safe(List<String> values) {
        return values == null ? List.of() : values;
    }

    private boolean matches(String value, String expected) {
        return value.contains(expected) || expected.contains(value);
    }

    private String norm(String value) {
        return value == null ? "" : Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).replace('đ', 'd').trim();
    }

    private String allergenTerm(HealthAllergenType type) {
        return switch (type) {
            case PEANUT -> "dau phong";
            case TREE_NUT -> "hat";
            case MILK -> "sua";
            case EGG -> "trung";
            case SEAFOOD -> "hai san";
            case SOY -> "dau nanh";
            case WHEAT -> "lua mi";
            case SESAME -> "me";
            case OTHER -> "";
        };
    }
}
