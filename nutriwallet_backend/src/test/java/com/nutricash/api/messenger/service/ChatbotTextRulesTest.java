package com.nutricash.api.messenger.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ChatbotTextRulesTest {
    @Test void recognizesAllVietnameseCodeKeywords() {
        for (String text : new String[]{"mã", "code", "mã web", "mã liên kết", "mã kết nối", "lấy mã", "xin mã", "mã của tôi"})
            assertThat(ChatbotTextRules.asksForLinkCode(text)).as(text).isTrue();
    }
    @Test void linkedAlreadyIsResolvedAsAccountStatusRequest() {
        assertThat(ChatbotTextRules.asksForLinkCode("Tôi liên kết rồi")).isTrue();
    }
    @Test void ordinaryNutritionQuestionIsNotCodeRequest() {
        assertThat(ChatbotTextRules.asksForLinkCode("Hôm nay tôi nên ăn gì?")).isFalse();
    }
}
