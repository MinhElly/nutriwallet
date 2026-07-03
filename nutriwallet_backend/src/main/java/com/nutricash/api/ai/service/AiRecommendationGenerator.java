package com.nutricash.api.ai.service;

import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.util.List;

public interface AiRecommendationGenerator {

    List<AiRecommendationDraft> generate(User user, UserSetting setting, BigDecimal spentAmount, BigDecimal budgetLimit);
}
