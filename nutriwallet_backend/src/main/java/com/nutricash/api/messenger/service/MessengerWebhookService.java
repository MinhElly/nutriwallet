package com.nutricash.api.messenger.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.ai.service.AiPromptBuilder;
import com.nutricash.api.ai.service.AiProviderService;
import com.nutricash.api.common.enums.ChatbotMessageType;
import com.nutricash.api.common.enums.ChatbotPlatform;
import com.nutricash.api.expense.entity.ExpenseRecord;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.messenger.dto.MessengerMessage;
import com.nutricash.api.messenger.dto.MessengerWebhookRequest;
import com.nutricash.api.messenger.entity.ChatbotMessage;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.messenger.repository.ChatbotMessageRepository;
import com.nutricash.api.messenger.repository.ChatbotProfileRepository;
import com.nutricash.api.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessengerWebhookService {

    private final ChatbotProfileRepository chatbotProfileRepository;
    private final ChatbotMessageRepository chatbotMessageRepository;
    private final MealRepository mealRepository;
    private final ExpenseRepository expenseRepository;
    private final AiProviderService aiProviderService;
    private final AiPromptBuilder aiPromptBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.messenger.verify-token:my_messenger_verify_token}")
    private String verifyToken;

    @Value("${app.messenger.page-access-token:}")
    private String pageAccessToken;

    public boolean verifyToken(String mode, String token) {
        return "subscribe".equals(mode) && verifyToken.equals(token);
    }

    @Transactional
    public void processWebhookRequest(MessengerWebhookRequest request) {
        if (request == null || request.entry() == null) {
            return;
        }

        for (var entry : request.entry()) {
            if (entry.messaging() == null) {
                continue;
            }
            for (var messaging : entry.messaging()) {
                if (messaging.sender() == null || messaging.sender().id() == null) {
                    continue;
                }
                String psid = messaging.sender().id();
                var message = messaging.message();
                if (message == null) {
                    continue;
                }

                try {
                    handleUserMessage(psid, message);
                } catch (Exception e) {
                    log.error("Error processing message for PSID: {}", psid, e);
                    sendFacebookMessage(psid, "Có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.");
                }
            }
        }
    }

    private void handleUserMessage(String psid, MessengerMessage message) {
        // 1. Tìm hoặc tạo ChatbotProfile
        ChatbotProfile profile = chatbotProfileRepository.findByPsid(psid)
                .orElseGet(() -> createGuestProfile(psid));

        // Lưu tin nhắn đến của người dùng
        String incomingText = message.text();
        String imageUrl = null;
        if (message.attachments() != null && !message.attachments().isEmpty()) {
            var firstAttachment = message.attachments().get(0);
            if ("image".equals(firstAttachment.type()) && firstAttachment.payload() != null) {
                imageUrl = firstAttachment.payload().url();
            }
        }

        saveMessage(profile, ChatbotMessageType.TEXT, incomingText, imageUrl, true);

        // 2. Kiểm tra trạng thái liên kết
        if (profile.getUser() == null) {
            String welcomeMsg = "Chào mừng bạn đến với NutriWallet AI Advisor! 👋\n\n" +
                    "Tài khoản Messenger của bạn chưa được liên kết với NutriWallet.\n" +
                    "Hãy đăng nhập vào website NutriWallet và nhập mã liên kết này để bắt đầu đồng bộ dữ liệu: \n\n" +
                    "👉 **" + profile.getGuestSessionCode() + "**";
            sendFacebookMessage(psid, welcomeMsg);
            saveMessage(profile, ChatbotMessageType.TEXT, welcomeMsg, null, false);
            return;
        }

        User user = profile.getUser();

        // 3. Xử lý tin nhắn ảnh (Phân tích bữa ăn)
        if (imageUrl != null) {
            sendFacebookMessage(psid, "Đang phân tích hình ảnh bữa ăn của bạn, vui lòng đợi một chút... ⏳");
            analyzeAndSaveMeal(profile, user, imageUrl);
            return;
        }

        // 4. Xử lý tin nhắn văn bản bằng AI kết hợp ngữ cảnh
        if (incomingText != null && !incomingText.isBlank()) {
            String aiResponse = generateAiResponse(user, incomingText);
            sendFacebookMessage(psid, aiResponse);
            saveMessage(profile, ChatbotMessageType.TEXT, aiResponse, null, false);
        }
    }

    private ChatbotProfile createGuestProfile(String psid) {
        String code = "NW-" + generateRandomCode(6);
        ChatbotProfile profile = ChatbotProfile.builder()
                .psid(psid)
                .platform(ChatbotPlatform.MESSENGER)
                .guestSessionCode(code)
                .build();
        return chatbotProfileRepository.save(profile);
    }

    private String generateRandomCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private void saveMessage(ChatbotProfile profile, ChatbotMessageType type, String text, String attachmentUrl, boolean isFromUser) {
        ChatbotMessage chatbotMessage = ChatbotMessage.builder()
                .chatbotProfile(profile)
                .type(type)
                .messageText(text)
                .attachmentUrl(attachmentUrl)
                .isFromUser(isFromUser)
                .build();
        chatbotMessageRepository.save(chatbotMessage);
    }

    private void analyzeAndSaveMeal(ChatbotProfile profile, User user, String imageUrl) {
        try {
            String systemPrompt = "You are an expert nutritionist. Analyze this meal image. Return ONLY a JSON object with the following fields: " +
                    "foodName (String), calories (number), proteinGram (number), carbGram (number), fatGram (number). " +
                    "Do not include any markdown format (like ```json) or additional text.";
            String userPrompt = "Meal image URL: " + imageUrl;

            String rawResponse = aiProviderService.generate(systemPrompt, userPrompt);
            log.info("AI Analysis Response for chatbot: {}", rawResponse);

            // Parse JSON response
            String cleanJson = rawResponse.replace("```json", "").replace("```", "").trim();
            JsonNode jsonNode = objectMapper.readTree(cleanJson);

            String foodName = jsonNode.has("foodName") ? jsonNode.get("foodName").asText() : "Bữa ăn từ Messenger";
            BigDecimal calories = jsonNode.has("calories") ? jsonNode.get("calories").decimalValue() : BigDecimal.ZERO;
            BigDecimal protein = jsonNode.has("proteinGram") ? jsonNode.get("proteinGram").decimalValue() : BigDecimal.ZERO;
            BigDecimal carb = jsonNode.has("carbGram") ? jsonNode.get("carbGram").decimalValue() : BigDecimal.ZERO;
            BigDecimal fat = jsonNode.has("fatGram") ? jsonNode.get("fatGram").decimalValue() : BigDecimal.ZERO;

            // Lưu vào MealRecord
            MealRecord mealRecord = MealRecord.builder()
                    .user(user)
                    .chatbotProfile(profile)
                    .mealName(foodName)
                    .imageUrl(imageUrl)
                    .mealTime(LocalDateTime.now())
                    .totalCalories(calories)
                    .proteinGram(protein)
                    .carbGram(carb)
                    .fatGram(fat)
                    .aiEstimated(true)
                    .confirmedByUser(false)
                    .build();
            mealRepository.save(mealRecord);

            String responseMsg = "🍽️ **Kết quả phân tích dinh dưỡng:**\n" +
                    "- Món ăn: " + foodName + "\n" +
                    "- Năng lượng: " + calories + " kcal\n" +
                    "- Chất đạm (Protein): " + protein + "g\n" +
                    "- Chất bột đường (Carbs): " + carb + "g\n" +
                    "- Chất béo (Fat): " + fat + "g\n\n" +
                    "Bữa ăn này đã được ghi nhận tự động vào nhật ký NutriWallet của bạn! ✅";

            sendFacebookMessage(profile.getPsid(), responseMsg);
            saveMessage(profile, ChatbotMessageType.TEXT, responseMsg, null, false);

        } catch (Exception e) {
            log.error("Failed to analyze meal image from Chatbot", e);
            sendFacebookMessage(profile.getPsid(), "Không thể phân tích được hình ảnh này. Hãy thử chụp ảnh rõ ràng hơn hoặc nhập mô tả bằng văn bản.");
        }
    }

    private String generateAiResponse(User user, String userText) {
        try {
            // Lấy ngữ cảnh hôm nay của người dùng
            ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
            LocalDate today = LocalDate.now(zoneId);
            LocalDateTime startOfDay = today.atStartOfDay();
            LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

            // Hôm nay ăn gì
            List<MealRecord> todayMeals = mealRepository.findAllByUserIdAndMealTimeBetweenOrderByMealTimeDesc(user.getId(), startOfDay, endOfDay);
            String mealsSummary = todayMeals.isEmpty() ? "Chưa ghi nhận bữa ăn nào." :
                    todayMeals.stream()
                            .map(m -> "- " + m.getMealName() + " (" + m.getTotalCalories() + " kcal)")
                            .collect(Collectors.joining("\n"));

            BigDecimal totalCalories = todayMeals.stream()
                    .map(m -> m.getTotalCalories() != null ? m.getTotalCalories() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Hôm nay tiêu gì
            List<ExpenseRecord> todayExpenses = expenseRepository.findAllByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(user.getId(), today, today);
            String expensesSummary = todayExpenses.isEmpty() ? "Chưa ghi nhận chi tiêu ăn uống nào." :
                    todayExpenses.stream()
                            .map(e -> "- " + e.getCategory() + ": " + e.getAmount() + " " + e.getCurrency() + (e.getNote() != null ? " (" + e.getNote() + ")" : ""))
                            .collect(Collectors.joining("\n"));

            BigDecimal totalExpense = todayExpenses.stream()
                    .map(e -> e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String systemPrompt = aiPromptBuilder.chat() + "\n\n" +
                    "Ngữ cảnh hôm nay của người dùng (" + user.getFullName() + "):\n" +
                    "- Các bữa ăn đã dùng:\n" + mealsSummary + "\n" +
                    "- Tổng calo đã nạp: " + totalCalories + " kcal\n" +
                    "- Các khoản chi tiêu hôm nay:\n" + expensesSummary + "\n" +
                    "- Tổng chi tiêu: " + totalExpense + " VND/USD.\n\n" +
                    "Hãy trả lời tin nhắn của người dùng một cách thân thiện, ngắn gọn và hữu ích dựa trên ngữ cảnh này.";

            return aiProviderService.generate(systemPrompt, userText);
        } catch (Exception e) {
            log.error("Failed to generate AI response for chatbot context", e);
            return aiProviderService.generate(aiPromptBuilder.chat(), userText);
        }
    }

    private void sendFacebookMessage(String recipientId, String text) {
        if (pageAccessToken == null || pageAccessToken.isBlank()) {
            log.warn("MESSENGER_PAGE_ACCESS_TOKEN is not configured. Cannot send message to recipient: {}", recipientId);
            return;
        }

        String url = "https://graph.facebook.com/v19.0/me/messages?access_token=" + pageAccessToken;

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> recipient = new HashMap<>();
        recipient.put("id", recipientId);
        requestBody.put("recipient", recipient);

        Map<String, Object> message = new HashMap<>();
        message.put("text", text);
        requestBody.put("message", message);

        try {
            restTemplate.postForObject(url, requestBody, String.class);
            log.info("Successfully sent message to Facebook PSID: {}", recipientId);
        } catch (Exception e) {
            log.error("Failed to send HTTP message response to Facebook Graph API for PSID: {}", recipientId, e);
        }
    }
}
