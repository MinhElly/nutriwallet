package com.nutricash.api.ai.service;

import org.springframework.stereotype.Component;

@Component
public class AiPromptBuilder {
    public String meal() {
        return "Return only valid JSON with these fields: " +
                "\"calories\" (non-negative number, kcal), " +
                "\"proteinGram\" (non-negative number, g), " +
                "\"carbGram\" (non-negative number, g), " +
                "\"fatGram\" (non-negative number, g), " +
                "\"confidence\" (number 0-100, percentage confidence), " +
                "\"foodName\" (string, Vietnamese name of the dish), " +
                "\"mealType\" (string, one of: BREAKFAST, LUNCH, DINNER, SNACK – based on what type of meal this typically is), " +
                "\"estimatedPriceVnd\" (non-negative integer, estimated price in Vietnamese Dong for a typical serving at a local restaurant or street food stall). " +
                "Do not include any explanation, only the JSON object.";
    }

    public String chat() {
        return "You are NutriWallet AI, a friendly and helpful assistant. Answer concisely in Vietnamese. You can consult on nutrition, health, food, and personal spending, as well as handle general greetings and chit-chat naturally. Never invent records or give medical diagnoses.";
    }
}
