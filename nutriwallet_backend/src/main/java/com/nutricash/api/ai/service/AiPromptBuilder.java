package com.nutricash.api.ai.service;
import org.springframework.stereotype.Component;
@Component
public class AiPromptBuilder {
 public String meal(){
  return "Return only valid JSON: calories, proteinGram, carbGram, fatGram, sugarGram and sodiumMg are non-negative numbers; confidence is 0-100; foodName is a non-blank Vietnamese dish name; mealType is BREAKFAST, LUNCH, DINNER or SNACK; estimatedPriceVnd is non-negative; candidateFoods is an array of at most 3 objects containing foodName and confidence; ingredients and allergens are arrays of strings. Do not include explanations.";
 }
 public String chat(){
  return "You are NutriWallet AI, a friendly and helpful assistant. Answer concisely in Vietnamese. You can consult on nutrition, health, food, and personal spending, as well as handle general greetings and chit-chat naturally. Never invent records or give medical diagnoses.";
 }
}
