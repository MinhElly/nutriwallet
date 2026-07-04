package com.nutricash.api.messenger.service;

import com.nutricash.api.expense.entity.ExpenseRecord;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.health.dto.HealthProfileResponse;
import com.nutricash.api.health.service.HealthProfileService;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.setting.service.UserSettingService;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.Normalizer;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessengerInsightService {
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final MealRepository meals;
    private final ExpenseRepository expenses;
    private final HealthProfileService healthProfiles;
    private final UserSettingService settings;
    private final MessengerReplyService replies;

    @Transactional(readOnly = true)
    public boolean handle(ChatbotProfile profile, String input) {
        if (input == null || input.isBlank()) return false;
        String text = normalize(input);
        Intent intent = intent(text);
        if (intent == Intent.NONE) return false;
        if (profile.getUser() == null) {
            replies.send(profile, "Bạn cần liên kết tài khoản NutriWallet để xem số liệu cá nhân và hồ sơ sức khỏe.");
            return true;
        }

        LocalDate today = LocalDate.now(ZONE);
        List<MealRecord> todayMeals = meals.findAllByUserIdAndMealTimeBetweenOrderByMealTimeDesc(
                profile.getUser().getId(), today.atStartOfDay(), today.atTime(LocalTime.MAX));
        List<ExpenseRecord> todayExpenses = expenses.findAllByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(
                profile.getUser().getId(), today, today);

        if (intent == Intent.NUTRITION) {
            replies.send(profile, nutrition(todayMeals));
            return true;
        }
        if (intent == Intent.SPENDING) {
            replies.send(profile, spending(todayExpenses));
            return true;
        }

        HealthProfileResponse health = healthProfiles.toResponse(healthProfiles.getOrCreate(profile.getUser()));
        UserSetting setting = settings.getOrCreateUserSetting(profile.getUser());
        String response = health(profile, setting, health) + "\n\n" + nutrition(todayMeals) + "\n\n" + spending(todayExpenses)
                + "\n\nThông tin sức khỏe là dữ liệu tự khai và không thay thế tư vấn y khoa.";
        if (health.firstCompletedAt() == null || !health.consentGiven()) {
            replies.sendQuickReplies(profile, response + "\n\nBạn muốn thiết lập hồ sơ sức khỏe ngay không?",
                    List.of(q("Bắt đầu", "HEALTH_START_INITIAL"), q("Để sau", "HEALTH_LATER")));
        } else {
            replies.sendQuickReplies(profile, response + "\n\nBạn muốn cập nhật hồ sơ không?",
                    List.of(q("Cập nhật", "HEALTH_START_QUARTERLY"), q("Không thay đổi", "HEALTH_NO_CHANGE_QUARTERLY")));
        }
        return true;
    }

    private Intent intent(String text) {
        if (containsAny(text, "suc khoe", "benh nen", "di ung", "ho so suc khoe", "the trang"))
            return Intent.HEALTH;
        if (containsAny(text, "hom nay an", "da an gi", "mon an", "calo", "dinh duong",
                "protein", "carb", "chat beo", "macro"))
            return Intent.NUTRITION;
        if (containsAny(text, "chi tieu", "da tieu", "tieu bao nhieu", "tien an", "tien da chi"))
            return Intent.SPENDING;
        return Intent.NONE;
    }

    private String health(ChatbotProfile profile, UserSetting s, HealthProfileResponse h) {
        if (h.firstCompletedAt() == null) return "Hồ sơ sức khỏe: chưa thiết lập.";
        String type = h.classification() == null ? "GENERAL" : h.classification().primaryType().name();
        String conditions = h.conditions().isEmpty() ? "Không khai báo" : h.conditions().stream().map(v -> v.type().name()).reduce((a,b) -> a + ", " + b).orElse("");
        String allergies = h.allergies().isEmpty() ? "Không khai báo" : h.allergies().stream().map(v -> v.type().name()).reduce((a,b) -> a + ", " + b).orElse("");
        String schedule = h.nextQuarterlyReviewAt() != null ? "Hàng quý - " + h.nextQuarterlyReviewAt() : h.nextAnnualReviewAt() != null ? "Hàng năm - " + h.nextAnnualReviewAt() : "Chưa chọn";
        return "Hồ sơ sức khỏe:\n- Tên: " + profile.getUser().getFullName() + "\n- Tuổi: " + value(s.getAge())
                + "\n- Giới tính: " + value(s.getGender()) + "\n- Chiều cao: " + value(s.getHeight()) + " cm"
                + "\n- Cân nặng: " + value(s.getWeight()) + " kg\n- Vận động: " + value(s.getActivityLevel())
                + "\n- Chế độ ăn: " + value(s.getDiet()) + "\n- Mục tiêu: " + value(s.getGoal())
                + "\n- Nhóm: " + type + "\n- Bệnh nền: " + conditions + "\n- Dị ứng: " + allergies
                + "\n- Hạn chế: " + (h.foodRestrictions().isEmpty() ? "Không" : String.join(", ", h.foodRestrictions()))
                + "\n- Lịch đánh giá lại: " + schedule;
    }

    private String value(Object value) { return value == null || value.toString().isBlank() ? "Chưa cập nhật" : value.toString(); }
    private String nutrition(List<MealRecord> values) {
        if (values.isEmpty()) return "Dinh dưỡng hôm nay: chưa ghi nhận bữa ăn.";
        BigDecimal calories = sum(values, MealRecord::getTotalCalories);
        BigDecimal protein = sum(values, MealRecord::getProteinGram);
        BigDecimal carb = sum(values, MealRecord::getCarbGram);
        BigDecimal fat = sum(values, MealRecord::getFatGram);
        String names = values.stream().limit(5).map(MealRecord::getMealName).reduce((a,b) -> a + ", " + b).orElse("");
        return "Dinh dưỡng hôm nay:\n- Món: " + names + "\n- Tổng calo: " + plain(calories)
                + " kcal\n- Protein: " + plain(protein) + "g\n- Carb: " + plain(carb)
                + "g\n- Chất béo: " + plain(fat) + "g";
    }

    private String spending(List<ExpenseRecord> values) {
        BigDecimal total = values.stream().map(ExpenseRecord::getAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return values.isEmpty() ? "Chi tiêu ăn uống hôm nay: chưa ghi nhận khoản chi."
                : "Chi tiêu ăn uống hôm nay:\n- Số khoản: " + values.size()
                + "\n- Tổng đã chi: " + money(total) + " VND";
    }

    private BigDecimal sum(List<MealRecord> values, java.util.function.Function<MealRecord, BigDecimal> field) {
        return values.stream().map(field).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    private String money(BigDecimal value) {
        NumberFormat f = NumberFormat.getIntegerInstance(Locale.forLanguageTag("vi-VN"));
        return f.format(value.setScale(0, java.math.RoundingMode.HALF_UP));
    }
    private String plain(BigDecimal value) { return value.stripTrailingZeros().toPlainString(); }
    private MessengerReplyService.QuickReply q(String title, String payload) {
        return new MessengerReplyService.QuickReply(title, payload);
    }
    private boolean containsAny(String value, String... terms) {
        return Arrays.stream(terms).anyMatch(value::contains);
    }
    private String normalize(String value) {
        return Normalizer.normalize(value.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").replace('đ','d').replaceAll("\\s+"," ").trim();
    }
    private enum Intent { HEALTH, NUTRITION, SPENDING, NONE }
}
