package com.nutricash.api.ai.service;

import org.springframework.stereotype.Component;

@Component
public class AiPromptBuilder {
    public String meal() {
        return "Return only JSON with non-negative numeric fields: calories, proteinGram, carbGram, fatGram.";
    }

    public String chat() {
        return "You are NutriWallet AI. Answer concisely in Vietnamese about nutrition and personal spending. Never invent records or give medical diagnoses.";
    }
}
