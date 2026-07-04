package com.nutricash.api.messenger.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.common.enums.ChatbotActionStatus;
import com.nutricash.api.common.enums.ChatbotActionType;
import com.nutricash.api.health.dto.*;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.service.HealthAssessmentService;
import com.nutricash.api.health.service.HealthProfileService;
import com.nutricash.api.messenger.dto.MessengerMessage;
import com.nutricash.api.messenger.entity.ChatbotPendingAction;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.messenger.repository.ChatbotPendingActionRepository;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessengerHealthFlowService {
    private final ChatbotPendingActionRepository actions;
    private final HealthAssessmentService assessments;
    private final HealthProfileService profiles;
    private final MessengerReplyService replies;
    private final ObjectMapper mapper = new ObjectMapper();

    @Transactional
    public void offerInitial(ChatbotProfile profile) {
        if (profile == null || profile.getUser() == null) return;
        var health = profiles.toResponse(profiles.getOrCreate(profile.getUser()));
        if (health.firstCompletedAt() != null || active(profile).isPresent()) return;
        replies.sendQuickReplies(profile,
                "Để NutriWallet cảnh báo món ăn phù hợp hơn, bạn có muốn thiết lập hồ sơ sức khỏe ban đầu không?",
                List.of(q("Bắt đầu", "HEALTH_START_INITIAL"), q("Để sau", "HEALTH_LATER")));
    }

    @Transactional
    public boolean handle(ChatbotProfile profile, MessengerMessage message) {
        if (profile == null || profile.getUser() == null || message == null) return false;
        String payload = message.quickReply() == null ? null : message.quickReply().payload();
        String text = clean(message.text());

        if ("HEALTH_LATER".equals(payload)) {
            replies.send(profile, "Bạn có thể nhắn “hồ sơ sức khỏe” bất cứ lúc nào để bắt đầu.");
            return true;
        }
        if (payload != null && payload.startsWith("HEALTH_NO_CHANGE_")) {
            AssessmentType type = type(payload.substring("HEALTH_NO_CHANGE_".length()));
            profiles.markAssessmentCompleted(profile.getUser(), type);
            cancelActive(profile);
            replies.send(profile, "Đã ghi nhận hồ sơ sức khỏe không thay đổi và cập nhật lịch rà soát tiếp theo.");
            return true;
        }
        if (payload != null && payload.startsWith("HEALTH_START_")) {
            start(profile, type(payload.substring("HEALTH_START_".length())));
            return true;
        }
        if (text != null && normalize(text).matches(".*(ho so suc khoe|danh gia suc khoe|cap nhat suc khoe).*")) {
            start(profile, AssessmentType.INITIAL);
            return true;
        }

        Optional<ChatbotPendingAction> pending = active(profile);
        if (pending.isEmpty()) return false;
        ChatbotPendingAction action = pending.get();
        if (expired(action)) {
            action.setStatus(ChatbotActionStatus.CANCELLED);
            actions.save(action);
            replies.send(profile, "Phiên cập nhật sức khỏe đã hết hạn. Nhắn “hồ sơ sức khỏe” để bắt đầu lại.");
            return true;
        }
        State state = read(action);
        return advance(profile, action, state, payload, text);
    }

    private void start(ChatbotProfile profile, AssessmentType type) {
        cancelActive(profile);
        AssessmentResponse session = assessments.start(profile.getUser(),
                new StartAssessmentRequest(AssessmentChannel.MESSENGER, type));
        State state = new State(session.id(), session.version(), type, "CONSENT",
                false, new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
        ChatbotPendingAction action = actions.save(ChatbotPendingAction.builder()
                .chatbotProfile(profile).type(ChatbotActionType.HEALTH_ASSESSMENT)
                .status(ChatbotActionStatus.AWAITING_CONFIRMATION).payloadJson(write(state))
                .expiresAt(Instant.now().plusSeconds(7 * 24 * 3600)).build());
        replies.sendQuickReplies(profile,
                "Thông tin này do bạn tự khai, chỉ dùng để cá nhân hóa cảnh báo và không thay thế chẩn đoán y khoa. Bạn đồng ý tiếp tục?",
                List.of(q("Đồng ý", "HEALTH_CONSENT_YES"), q("Không đồng ý", "HEALTH_CONSENT_NO")));
    }

    private boolean advance(ChatbotProfile profile, ChatbotPendingAction action, State s, String payload, String text) {
        switch (s.step()) {
            case "CONSENT" -> {
                if ("HEALTH_CONSENT_NO".equals(payload)) {
                    complete(profile, action, s, false);
                    replies.send(profile, "Đã ghi nhận lựa chọn không cung cấp thông tin sức khỏe.");
                    return true;
                }
                if (!"HEALTH_CONSENT_YES".equals(payload)) {
                    replies.sendQuickReplies(profile, "Vui lòng chọn đồng ý hoặc không đồng ý.",
                            List.of(q("Đồng ý", "HEALTH_CONSENT_YES"), q("Không đồng ý", "HEALTH_CONSENT_NO")));
                    return true;
                }
                State next = s.withStep("CONDITIONS").withConsent(true);
                persist(action, next);
                replies.send(profile, "Bạn có bệnh nền nào? Nhập cách nhau bằng dấu phẩy: tiểu đường, tăng huyết áp, bệnh thận, tim mạch; hoặc nhập “không”.");
                return true;
            }
            case "CONDITIONS" -> {
                if (text == null) return promptText(profile, "Vui lòng nhập bệnh nền hoặc “không”.");
                State next = s.withConditions(parseConditions(text)).withStep("ALLERGIES");
                persist(action, next);
                replies.send(profile, "Bạn dị ứng thực phẩm nào? Ví dụ: đậu phộng, sữa, trứng, hải sản; hoặc nhập “không”.");
                return true;
            }
            case "ALLERGIES" -> {
                if (text == null) return promptText(profile, "Vui lòng nhập dị ứng hoặc “không”.");
                State next = s.withAllergies(parseAllergies(text)).withStep("RESTRICTIONS");
                persist(action, next);
                replies.send(profile, "Bạn có chế độ hoặc thực phẩm cần hạn chế không? Nhập nội dung, cách nhau bằng dấu phẩy; hoặc “không”.");
                return true;
            }
            case "RESTRICTIONS" -> {
                if (text == null) return promptText(profile, "Vui lòng nhập hạn chế thực phẩm hoặc “không”.");
                State next = s.withRestrictions(parseList(text)).withStep("CONFIRM");
                persist(action, next);
                replies.sendQuickReplies(profile, summary(next),
                        List.of(q("Lưu hồ sơ", "HEALTH_CONFIRM"), q("Làm lại", "HEALTH_RESTART")));
                return true;
            }
            case "CONFIRM" -> {
                if ("HEALTH_RESTART".equals(payload)) {
                    start(profile, s.type());
                    return true;
                }
                if (!"HEALTH_CONFIRM".equals(payload)) {
                    replies.sendQuickReplies(profile, summary(s),
                            List.of(q("Lưu hồ sơ", "HEALTH_CONFIRM"), q("Làm lại", "HEALTH_RESTART")));
                    return true;
                }
                complete(profile, action, s, true);
                var result = profiles.toResponse(profiles.getOrCreate(profile.getUser())).classification();
                replies.send(profile, "Đã lưu hồ sơ sức khỏe. Nhóm cá nhân hóa hiện tại: "
                        + (result == null ? "GENERAL" : result.primaryType()) + ".");
                return true;
            }
            default -> {
                action.setStatus(ChatbotActionStatus.FAILED);
                actions.save(action);
                return true;
            }
        }
    }

    private void complete(ChatbotProfile profile, ChatbotPendingAction action, State s, boolean consent) {
        UpdateHealthProfileRequest request = new UpdateHealthProfileRequest(consent,
                consent ? s.conditions() : List.of(), consent ? s.allergies() : List.of(),
                consent ? s.restrictions() : List.of(), null);
        assessments.complete(profile.getUser(), s.sessionId(),
                new CompleteAssessmentRequest(request, s.sessionVersion()));
        action.setStatus(ChatbotActionStatus.COMPLETED);
        actions.save(action);
    }

    private void persist(ChatbotPendingAction action, State state) {
        Map<String, Object> answers = mapper.convertValue(state, new TypeReference<>() {});
        AssessmentResponse updated = assessments.update(action.getChatbotProfile().getUser(), state.sessionId(),
                new UpdateAssessmentRequest(state.step(), answers, state.sessionVersion()));
        State versioned = state.withVersion(updated.version());
        action.setPayloadJson(write(versioned));
        actions.save(action);
    }

    private Optional<ChatbotPendingAction> active(ChatbotProfile profile) {
        return actions.findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(profile.getId(),
                        List.of(ChatbotActionStatus.AWAITING_CONFIRMATION, ChatbotActionStatus.PROCESSING))
                .filter(a -> a.getType() == ChatbotActionType.HEALTH_ASSESSMENT);
    }

    private void cancelActive(ChatbotProfile profile) {
        active(profile).ifPresent(a -> { a.setStatus(ChatbotActionStatus.CANCELLED); actions.save(a); });
    }

    private boolean expired(ChatbotPendingAction action) {
        return action.getExpiresAt() != null && !action.getExpiresAt().isAfter(Instant.now());
    }

    private State read(ChatbotPendingAction action) {
        try { return mapper.readValue(action.getPayloadJson(), State.class); }
        catch (Exception e) { throw new IllegalStateException("Invalid health assessment state", e); }
    }
    private String write(Object value) {
        try { return mapper.writeValueAsString(value); }
        catch (Exception e) { throw new IllegalStateException("Cannot persist health assessment state", e); }
    }
    private AssessmentType type(String value) {
        try { return AssessmentType.valueOf(value); }
        catch (Exception e) { return AssessmentType.INITIAL; }
    }
    private boolean promptText(ChatbotProfile p, String text) { replies.send(p, text); return true; }
    private MessengerReplyService.QuickReply q(String title, String payload) { return new MessengerReplyService.QuickReply(title, payload); }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String normalize(String value) {
        return java.text.Normalizer.normalize(value.toLowerCase(Locale.ROOT), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").replace('đ', 'd');
    }
    private List<String> parseList(String value) {
        String n = normalize(value);
        if (n.matches(".*\\b(khong|none|no)\\b.*")) return List.of();
        return Arrays.stream(value.split(",")).map(String::trim).filter(v -> !v.isBlank()).distinct().limit(20).toList();
    }
    private List<HealthConditionInput> parseConditions(String value) {
        String n = normalize(value);
        if (n.matches(".*\\b(khong|none|no)\\b.*")) return List.of();
        List<HealthConditionInput> out = new ArrayList<>();
        if (n.contains("tieu duong")) out.add(new HealthConditionInput(HealthConditionType.DIABETES, null));
        if (n.contains("huyet ap")) out.add(new HealthConditionInput(HealthConditionType.HYPERTENSION, null));
        if (n.contains("than")) out.add(new HealthConditionInput(HealthConditionType.KIDNEY_DISEASE, null));
        if (n.contains("tim")) out.add(new HealthConditionInput(HealthConditionType.CARDIOVASCULAR, null));
        if (out.isEmpty()) out.add(new HealthConditionInput(HealthConditionType.OTHER, value.trim()));
        return out;
    }
    private List<HealthAllergyInput> parseAllergies(String value) {
        String n = normalize(value);
        if (n.matches(".*\\b(khong|none|no)\\b.*")) return List.of();
        List<HealthAllergyInput> out = new ArrayList<>();
        Map<String, HealthAllergenType> aliases = new LinkedHashMap<>();
        aliases.put("dau phong", HealthAllergenType.PEANUT); aliases.put("hat", HealthAllergenType.TREE_NUT);
        aliases.put("sua", HealthAllergenType.MILK); aliases.put("trung", HealthAllergenType.EGG);
        aliases.put("hai san", HealthAllergenType.SEAFOOD); aliases.put("dau nanh", HealthAllergenType.SOY);
        aliases.put("lua mi", HealthAllergenType.WHEAT); aliases.put("me", HealthAllergenType.SESAME);
        aliases.forEach((k, v) -> { if (n.contains(k) && out.stream().noneMatch(i -> i.type() == v)) out.add(new HealthAllergyInput(v, null)); });
        if (out.isEmpty()) out.add(new HealthAllergyInput(HealthAllergenType.OTHER, value.trim()));
        return out;
    }
    private String summary(State s) {
        return "Xác nhận hồ sơ:\n- Bệnh nền: " + (s.conditions().isEmpty() ? "Không" : s.conditions())
                + "\n- Dị ứng: " + (s.allergies().isEmpty() ? "Không" : s.allergies())
                + "\n- Hạn chế: " + (s.restrictions().isEmpty() ? "Không" : s.restrictions());
    }

    public record State(Long sessionId, long sessionVersion, AssessmentType type, String step,
                        boolean consent, List<HealthConditionInput> conditions,
                        List<HealthAllergyInput> allergies, List<String> restrictions) {
        State withStep(String v) { return new State(sessionId, sessionVersion, type, v, consent, conditions, allergies, restrictions); }
        State withVersion(long v) { return new State(sessionId, v, type, step, consent, conditions, allergies, restrictions); }
        State withConsent(boolean v) { return new State(sessionId, sessionVersion, type, step, v, conditions, allergies, restrictions); }
        State withConditions(List<HealthConditionInput> v) { return new State(sessionId, sessionVersion, type, step, consent, v, allergies, restrictions); }
        State withAllergies(List<HealthAllergyInput> v) { return new State(sessionId, sessionVersion, type, step, consent, conditions, v, restrictions); }
        State withRestrictions(List<String> v) { return new State(sessionId, sessionVersion, type, step, consent, conditions, allergies, v); }
    }
}
