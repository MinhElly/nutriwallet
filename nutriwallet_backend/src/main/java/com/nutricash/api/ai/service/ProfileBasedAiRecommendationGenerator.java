package com.nutricash.api.ai.service;

import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ProfileBasedAiRecommendationGenerator implements AiRecommendationGenerator {

    @Override
    public List<AiRecommendationDraft> generate(User user, UserSetting setting, BigDecimal spentAmount, BigDecimal budgetLimit) {
        List<AiRecommendationDraft> drafts = new ArrayList<>();

        addProfileCompletionRecommendation(setting, drafts);
        addBodyCompositionRecommendation(setting, drafts);
        addBudgetRecommendation(spentAmount, budgetLimit, drafts);
        addActivityRecommendation(setting, drafts);

        if (drafts.isEmpty()) {
            drafts.add(new AiRecommendationDraft(
                    "Hồ sơ của bạn đã sẵn sàng. Hãy tiếp tục ghi nhận bữa ăn để AI cá nhân hóa gợi ý sát hơn.",
                    "profile",
                    "info"));
        }

        return drafts;
    }

    private void addProfileCompletionRecommendation(UserSetting setting, List<AiRecommendationDraft> drafts) {
        List<String> missing = new ArrayList<>();
        if (!StringUtils.hasText(setting.getGoal())) {
            missing.add("mục tiêu");
        }
        if (!StringUtils.hasText(setting.getDiet())) {
            missing.add("chế độ ăn");
        }
        if (!StringUtils.hasText(setting.getActivityLevel())) {
            missing.add("mức độ vận động");
        }
        if (setting.getWeight() == null) {
            missing.add("cân nặng");
        }
        if (setting.getHeight() == null) {
            missing.add("chiều cao");
        }

        if (!missing.isEmpty()) {
            drafts.add(new AiRecommendationDraft(
                    "Hoàn thiện thêm " + String.join(", ", missing)
                            + " để AI cá nhân hóa gợi ý về khẩu phần và chi tiêu chính xác hơn.",
                    "profile",
                    "info"));
        }
    }

    private void addBodyCompositionRecommendation(UserSetting setting, List<AiRecommendationDraft> drafts) {
        Double bmi = calculateBmi(setting.getWeight(), setting.getHeight());
        if (bmi == null) {
            return;
        }

        String goal = lower(setting.getGoal());
        String diet = lower(setting.getDiet());

        if (bmi >= 25.0d) {
            drafts.add(new AiRecommendationDraft(
                    "BMI hiện tại khoảng " + formatBmi(bmi)
                            + ". Nếu mục tiêu của bạn là " + goalText(goal)
                            + ", hãy ưu tiên khẩu phần giàu đạm nạc, rau xanh và giảm đồ chiên.",
                    "nutrition",
                    "warning"));
            return;
        }

        if (bmi < 18.5d) {
            drafts.add(new AiRecommendationDraft(
                    "BMI hiện tại khoảng " + formatBmi(bmi)
                            + ". Bạn nên tăng năng lượng và protein dần để tránh thiếu hụt dinh dưỡng.",
                    "nutrition",
                    "caution"));
            return;
        }

        String suffix = StringUtils.hasText(diet)
                ? " Phong cách ăn " + diet + " đang phù hợp, hãy giữ nhịp ổn định."
                : " Duy trì nhịp ăn cân bằng sẽ giúp AI nhận diện xu hướng tốt hơn.";
        drafts.add(new AiRecommendationDraft(
                "BMI hiện tại khoảng " + formatBmi(bmi)
                        + ". Cơ thể đang ở vùng tương đối cân bằng." + suffix,
                "nutrition",
                "success"));
    }

    private void addBudgetRecommendation(BigDecimal spentAmount, BigDecimal budgetLimit,
            List<AiRecommendationDraft> drafts) {
        if (budgetLimit == null || budgetLimit.signum() <= 0 || spentAmount == null) {
            return;
        }

        BigDecimal utilization = spentAmount.divide(budgetLimit, 4, RoundingMode.HALF_UP);
        int percent = utilization.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).intValue();

        if (utilization.compareTo(BigDecimal.valueOf(0.9d)) >= 0) {
            drafts.add(new AiRecommendationDraft(
                    "Bạn đã dùng khoảng " + percent + "% ngân sách hiện tại. Nên ưu tiên các bữa đơn giản, ít phát sinh thêm chi phí.",
                    "budget",
                    "warning"));
            return;
        }

        if (utilization.compareTo(BigDecimal.valueOf(0.7d)) >= 0) {
            drafts.add(new AiRecommendationDraft(
                    "Ngân sách đã dùng khoảng " + percent + "%. Đây là thời điểm phù hợp để kiểm soát các món phụ hoặc đồ uống thêm.",
                    "budget",
                    "caution"));
            return;
        }

        drafts.add(new AiRecommendationDraft(
                "Ngân sách mới dùng khoảng " + percent + "%. Bạn vẫn còn dư địa để giữ nhịp ăn uống ổn định trong kỳ này.",
                "budget",
                "success"));
    }

    private void addActivityRecommendation(UserSetting setting, List<AiRecommendationDraft> drafts) {
        String activityLevel = lower(setting.getActivityLevel());
        String goal = lower(setting.getGoal());
        if (!StringUtils.hasText(activityLevel)) {
            drafts.add(new AiRecommendationDraft(
                    "Hãy bổ sung mức độ vận động để AI tinh chỉnh gợi ý khẩu phần và nhịp sinh hoạt sát hơn.",
                    "profile",
                    "info"));
            return;
        }

        if (activityLevel.contains("sedentary") || activityLevel.contains("ít") || activityLevel.contains("low")) {
            drafts.add(new AiRecommendationDraft(
                    "Bạn đang ở mức vận động thấp. Nếu mục tiêu là " + goalText(goal)
                            + ", hãy thêm 15-20 phút đi bộ sau bữa chính để cải thiện hiệu quả.",
                    "suggestion",
                    "info"));
            return;
        }

        drafts.add(new AiRecommendationDraft(
                "Nhịp vận động hiện tại khá ổn. Giữ đều bữa ăn và nước uống sẽ giúp mục tiêu " + goalText(goal) + " bền hơn.",
                "positive",
                "success"));
    }

    private Double calculateBmi(Double weightKg, Double heightCm) {
        if (weightKg == null || heightCm == null || weightKg <= 0 || heightCm <= 0) {
            return null;
        }

        double heightMeters = heightCm / 100.0d;
        if (heightMeters <= 0) {
            return null;
        }

        return weightKg / (heightMeters * heightMeters);
    }

    private String formatBmi(double bmi) {
        return String.format(Locale.ROOT, "%.1f", bmi);
    }

    private String goalText(String goal) {
        if (!StringUtils.hasText(goal)) {
            return "cải thiện sức khỏe";
        }
        return goal;
    }

    private String lower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }
}
