package com.nutricash.api.messenger.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.ai.service.AiPromptBuilder;
import com.nutricash.api.ai.service.AiProviderService;
import com.nutricash.api.common.enums.ChatbotMessageType;
import com.nutricash.api.common.enums.ChatbotPlatform;
import com.nutricash.api.common.enums.ExpenseCategory;
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
import java.util.Collections;
import java.util.LinkedHashMap;
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

    private final Map<String, Boolean> processedMessageIds = Collections.synchronizedMap(new LinkedHashMap<>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Boolean> eldest) {
            return size() > 1000;
        }
    });

    @Value("${app.messenger.verify-token:my_messenger_verify_token}")
    private String verifyToken;

    @Value("${app.messenger.page-access-token:}")
    private String pageAccessToken;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

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

                String mid = message.mid();
                if (mid != null) {
                    if (processedMessageIds.putIfAbsent(mid, Boolean.TRUE) != null) {
                        log.info("Duplicate message detected and skipped: {}", mid);
                        continue;
                    }
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

        // Kiểm tra câu hỏi đặc biệt về mã liên kết hoặc tính năng của chatbot
        if (incomingText != null && !incomingText.isBlank()) {
            String normalized = normalizeText(incomingText);
            if (isAskingForLinkCode(normalized)) {
                if (profile.getUser() == null) {
                    String msg = "🔑 **Mã liên kết tài khoản Messenger của bạn là:**\n" +
                            "👉 **" + profile.getGuestSessionCode() + "**\n\n" +
                            "Vui lòng đăng nhập vào NutriWallet, đi tới phần **Cài đặt** -> **Bảo mật và kết nối** để nhập mã này nhé!\n" +
                            "🔗 Đăng nhập tại: " + frontendUrl + "/login";
                    sendFacebookMessage(psid, msg);
                    saveMessage(profile, ChatbotMessageType.TEXT, msg, null, false);
                } else {
                    String msg = "✅ Tài khoản Messenger của bạn đã được liên kết thành công với tài khoản NutriWallet rồi nhé!";
                    sendFacebookMessage(psid, msg);
                    saveMessage(profile, ChatbotMessageType.TEXT, msg, null, false);
                }
                return;
            }

            if (isAskingForCapabilities(normalized)) {
                String msg;
                if (profile.getUser() == null) {
                    msg = "🤖 **Mình là trợ lý NutriWallet, mình có thể giúp bạn:**\n\n" +
                            "1. **Phân tích dinh dưỡng từ ảnh**: Chỉ cần gửi ảnh chụp bữa ăn của bạn 📸\n" +
                            "2. **Tự động ghi nhật ký ăn uống và chi tiêu**: Tự động ước lượng dinh dưỡng & giá tiền 🍽️💰\n" +
                            "3. **Giải đáp thắc mắc**: Trả lời các câu hỏi về dinh dưỡng, sức khỏe và tài chính 💬\n\n" +
                            "👉 Để đồng bộ dữ liệu vào tài khoản của bạn, vui lòng liên kết tài khoản Messenger bằng mã:\n" +
                            "👉 **" + profile.getGuestSessionCode() + "**\n\n" +
                            "🔗 Đăng nhập tại: " + frontendUrl + "/login";
                } else {
                    msg = "🤖 **Mình là trợ lý NutriWallet, mình có thể giúp bạn:**\n\n" +
                            "1. **Phân tích dinh dưỡng từ ảnh**: Gửi ảnh bữa ăn để mình phân tích calo, protein, carb, fat 📸\n" +
                            "2. **Tự động ghi nhật ký**: Các món ăn bạn chụp sẽ tự động lưu vào tài khoản NutriWallet của bạn 🍽️\n" +
                            "3. **Tự động theo dõi chi tiêu**: Ước lượng và ghi nhận chi tiêu ăn uống tương ứng 💰\n" +
                            "4. **Giải đáp thắc mắc**: Trả lời các câu hỏi về dinh dưỡng, sức khỏe và tài chính dựa trên dữ liệu cá nhân của bạn hôm nay 💬";
                }
                sendFacebookMessage(psid, msg);
                saveMessage(profile, ChatbotMessageType.TEXT, msg, null, false);
                return;
            }
        }

        // 2. Kiểm tra trạng thái liên kết của khách (Guest)
        if (profile.getUser() == null) {
            long sentCount = chatbotMessageRepository.countByChatbotProfileIdAndIsFromUser(profile.getId(), true);
            if (sentCount > 10) {
                String blockMsg = "Bạn đã dùng hết 10 lượt nhắn tin/phân tích miễn phí dành cho khách hàng. 🛑\n\n" +
                        "Vui lòng đăng nhập hoặc đăng ký tài khoản NutriWallet và liên kết tài khoản bằng mã sau để tiếp tục sử dụng:\n" +
                        "👉 **" + profile.getGuestSessionCode() + "**\n\n" +
                        "🔗 Đăng nhập tại: " + frontendUrl + "/login";
                sendFacebookMessage(psid, blockMsg);
                saveMessage(profile, ChatbotMessageType.TEXT, blockMsg, null, false);
                return;
            }

            // Dưới 10 tin nhắn, cho phép khách sử dụng
            if (imageUrl != null) {
                sendFacebookMessage(psid, "Đang phân tích hình ảnh bữa ăn của bạn dưới vai trò Khách, vui lòng đợi một chút... ⏳");
                analyzeAndSaveMeal(profile, null, imageUrl);
                return;
            }

            if (incomingText != null && !incomingText.isBlank()) {
                String aiResponse = generateAiResponse(null, incomingText);
                aiResponse += "\n\n👉 Đăng nhập tài khoản NutriWallet ngay tại đây để liên kết và lưu trữ nhật ký lâu dài: " + frontendUrl + "/login";
                sendFacebookMessage(psid, aiResponse);
                saveMessage(profile, ChatbotMessageType.TEXT, aiResponse, null, false);
            }
            return;
        }

        User user = profile.getUser();

        // 3. Xử lý tin nhắn ảnh (Phân tích bữa ăn) cho người dùng đã liên kết
        if (imageUrl != null) {
            sendFacebookMessage(psid, "Đang phân tích hình ảnh bữa ăn của bạn, vui lòng đợi một chút... ⏳");
            analyzeAndSaveMeal(profile, user, imageUrl);
            return;
        }

        // 4. Xử lý tin nhắn văn bản bằng AI kết hợp ngữ cảnh hoặc xác nhận/cập nhật bữa ăn
        if (incomingText != null && !incomingText.isBlank()) {
            List<MealRecord> meals = mealRepository.findAllByChatbotProfileIdOrderByMealTimeDesc(profile.getId());
            if (!meals.isEmpty()) {
                MealRecord lastMeal = meals.get(0);
                if (!lastMeal.isConfirmedByUser() && lastMeal.getMealTime().isAfter(LocalDateTime.now().minusMinutes(5))) {
                    boolean handled = tryHandleMealConfirmation(profile, lastMeal, incomingText);
                    if (handled) {
                        return;
                    }
                }
            }

            String aiResponse = generateAiResponse(user, incomingText);
            sendFacebookMessage(psid, aiResponse);
            saveMessage(profile, ChatbotMessageType.TEXT, aiResponse, null, false);
        }
    }

    private boolean tryHandleMealConfirmation(ChatbotProfile profile, MealRecord meal, String userText) {
        try {
            BigDecimal originalPrice = BigDecimal.ZERO;
            Optional<ExpenseRecord> existingExpense = expenseRepository.findByMealRecordId(meal.getId());
            if (existingExpense.isPresent()) {
                originalPrice = existingExpense.get().getAmount();
            }

            String prompt = "You are an AI assistant parsing chatbot confirmation or updates for a logged meal.\n" +
                    "The original logged meal is: Name = \"" + meal.getMealName() + "\", Price = " + originalPrice + " VND.\n" +
                    "The user's message is: \"" + userText + "\"\n\n" +
                    "Determine if the user is confirming or updating the meal name or price.\n" +
                    "- If they say something like \"ok\", \"chuẩn\", \"đúng rồi\", \"xác nhận\", \"đúng\", set confirmed = true.\n" +
                    "- If they say something like \"cập nhật cơm tấm 45k\", \"sửa thành phở bò 50000\", \"cơm sườn 45000\", extract the updated details.\n\n" +
                    "Return ONLY a JSON object with the following fields:\n" +
                    "\"isUpdate\" (boolean, true if they want to confirm or update name/price, false otherwise),\n" +
                    "\"confirmed\" (boolean, true if they explicitly confirm or update details, false otherwise),\n" +
                    "\"updatedFoodName\" (String or null, the new food name if they want to change it),\n" +
                    "\"updatedPriceVnd\" (number or null, the new price in VND if they want to change/specify it).\n\n" +
                    "Do not include any markdown format or additional text.";

            String rawResponse = aiProviderService.generate(prompt, userText);
            log.info("Gemini Confirmation Parsing Response: {}", rawResponse);

            String cleanJson = rawResponse.replace("```json", "").replace("```", "").trim();
            JsonNode jsonNode = objectMapper.readTree(cleanJson);

            boolean isUpdate = jsonNode.has("isUpdate") && jsonNode.get("isUpdate").asBoolean();
            if (!isUpdate) {
                return false;
            }

            boolean confirmed = jsonNode.has("confirmed") && jsonNode.get("confirmed").asBoolean();
            String updatedFoodName = jsonNode.has("updatedFoodName") && !jsonNode.get("updatedFoodName").isNull() ? jsonNode.get("updatedFoodName").asText() : null;
            BigDecimal updatedPriceVnd = jsonNode.has("updatedPriceVnd") && !jsonNode.get("updatedPriceVnd").isNull() ? jsonNode.get("updatedPriceVnd").decimalValue() : null;

            if (updatedFoodName != null) {
                meal.setMealName(updatedFoodName);
            }
            if (confirmed) {
                meal.setConfirmedByUser(true);
            }
            mealRepository.save(meal);

            BigDecimal finalPrice = updatedPriceVnd != null ? updatedPriceVnd : originalPrice;
            String finalFoodName = updatedFoodName != null ? updatedFoodName : meal.getMealName();

            ExpenseRecord expense;
            if (existingExpense.isPresent()) {
                expense = existingExpense.get();
                expense.setAmount(finalPrice);
                expense.setNote("Tự động cập nhật từ Chatbot: " + finalFoodName);
                expenseRepository.save(expense);
            } else {
                int hour = LocalDateTime.now().getHour();
                ExpenseCategory category;
                if (hour < 11) {
                    category = ExpenseCategory.BREAKFAST;
                } else if (hour < 16) {
                    category = ExpenseCategory.LUNCH;
                } else if (hour < 21) {
                    category = ExpenseCategory.DINNER;
                } else {
                    category = ExpenseCategory.SNACK;
                }

                expense = ExpenseRecord.builder()
                        .user(profile.getUser())
                        .mealRecord(meal)
                        .amount(finalPrice)
                        .currency("VND")
                        .category(category)
                        .expenseDate(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                        .note("Tự động tạo từ Chatbot: " + finalFoodName)
                        .build();
                expenseRepository.save(expense);
            }

            String confirmationMsg = "✅ **Đã ghi nhận thay đổi!**\n" +
                    "- Món ăn: " + finalFoodName + "\n" +
                    "- Chi phí: " + finalPrice + " VND\n" +
                    "Nhật ký bữa ăn và chi tiêu của bạn đã được cập nhật thành công! 🍽️💰";
            sendFacebookMessage(profile.getPsid(), confirmationMsg);
            saveMessage(profile, ChatbotMessageType.TEXT, confirmationMsg, null, false);
            return true;

        } catch (Exception e) {
            log.error("Failed to parse meal confirmation/update from user text: {}", userText, e);
            return false;
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
            String systemPrompt = aiPromptBuilder.meal();
            String userPrompt = "Image URL: " + imageUrl;

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
            BigDecimal estimatedPriceVnd = jsonNode.has("estimatedPriceVnd") ? jsonNode.get("estimatedPriceVnd").decimalValue() : BigDecimal.ZERO;

            if (user != null) {
                // Lưu vào MealRecord cho người dùng đã liên kết
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
                mealRecord = mealRepository.save(mealRecord);

                // Tạo ExpenseRecord tự động với số tiền ước tính
                int hour = LocalDateTime.now().getHour();
                ExpenseCategory category;
                if (hour < 11) {
                    category = ExpenseCategory.BREAKFAST;
                } else if (hour < 16) {
                    category = ExpenseCategory.LUNCH;
                } else if (hour < 21) {
                    category = ExpenseCategory.DINNER;
                } else {
                    category = ExpenseCategory.SNACK;
                }

                ExpenseRecord expenseRecord = ExpenseRecord.builder()
                        .user(user)
                        .mealRecord(mealRecord)
                        .amount(estimatedPriceVnd)
                        .currency("VND")
                        .category(category)
                        .expenseDate(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                        .note("Tự động tạo từ Chatbot: " + foodName)
                        .build();
                expenseRepository.save(expenseRecord);
            }

            String responseMsg = "🍽️ **Kết quả phân tích dinh dưỡng:**\n" +
                    "Món: " + foodName + "\n" +
                    "Calo: " + calories + " kcal\n" +
                    "Đạm: " + protein + "g\n" +
                    "Carb: " + carb + "g\n" +
                    "Béo: " + fat + "g\n" +
                    "Tiền: " + estimatedPriceVnd + " VND\n\n";

            if (user != null) {
                responseMsg += "Bữa ăn này đã được ghi nhận tự động vào nhật ký NutriWallet của bạn! ✅\n" +
                        "💡 *Nếu muốn cập nhật lại thông tin (tên món, số tiền), hãy nhắn tin trả lời ví dụ: \"Cập nhật cơm tấm 45k\" hoặc \"Cập nhật cơm sườn 45000\".*";
            } else {
                responseMsg += "Đăng ký tài khoản và liên kết Messenger để ghi nhận tự động bữa ăn vào nhật ký NutriWallet của bạn! 📝\n" +
                        "👉 Đăng nhập ngay tại: " + frontendUrl + "/login";
            }

            sendFacebookMessage(profile.getPsid(), responseMsg);
            saveMessage(profile, ChatbotMessageType.TEXT, responseMsg, null, false);

        } catch (Exception e) {
            log.error("Failed to analyze meal image from Chatbot", e);
            sendFacebookMessage(profile.getPsid(), "Không thể phân tích được hình ảnh này. Hãy thử chụp ảnh rõ ràng hơn hoặc nhập mô tả bằng văn bản.");
        }
    }

    private String generateAiResponse(User user, String userText) {
        try {
            if (user == null) {
                return aiProviderService.generate(aiPromptBuilder.chat(), userText);
            }

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

    private String normalizeText(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean isAskingForLinkCode(String normalizedText) {
        return normalizedText.contains("ma lien ket") ||
               normalizedText.contains("ma ket noi") ||
               normalizedText.contains("code lien ket") ||
               normalizedText.contains("code ket noi") ||
               normalizedText.contains("lay ma") ||
               normalizedText.contains("xin ma") ||
               normalizedText.contains("ma cua toi") ||
               normalizedText.contains("link code") ||
               normalizedText.contains("connect code");
    }

    private boolean isAskingForCapabilities(String normalizedText) {
        return normalizedText.contains("lam duoc gi") ||
               normalizedText.contains("co the lam gi") ||
               normalizedText.contains("chuc nang") ||
               normalizedText.contains("tinh nang") ||
               normalizedText.contains("giup gi") ||
               normalizedText.contains("huong dan") ||
               normalizedText.contains("su dung the nao") ||
               normalizedText.contains("su dung nhu the nao") ||
               normalizedText.contains("su dung nhu nao") ||
               normalizedText.contains("huong dan su dung");
    }
}
