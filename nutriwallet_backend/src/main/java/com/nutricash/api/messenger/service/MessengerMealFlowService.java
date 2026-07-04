package com.nutricash.api.messenger.service;

import com.fasterxml.jackson.databind.*;
import com.nutricash.api.ai.dto.*;
import com.nutricash.api.ai.entity.AiAnalysisLog;
import com.nutricash.api.ai.repository.AiAnalysisLogRepository;
import com.nutricash.api.ai.service.MealHealthWarningService;
import com.nutricash.api.common.enums.*;
import com.nutricash.api.messenger.dto.MessengerMessage;
import com.nutricash.api.messenger.entity.*;
import com.nutricash.api.messenger.repository.ChatbotPendingActionRepository;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessengerMealFlowService {
    private final AiAnalysisLogRepository logs;
    private final ChatbotPendingActionRepository actions;
    private final ConfirmedMealApplicationService confirmedMeals;
    private final MealHealthWarningService healthWarnings;
    private final MessengerReplyService replies;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.ai.clarification-confidence-threshold:75}")
    private BigDecimal threshold;

    @Transactional
    public void begin(ChatbotProfile profile, User user, String imageUrl, JsonNode j, String raw, String model) {
        List<AiFoodCandidate> candidates = candidates(j.path("candidateFoods"));
        List<String> ingredients = strings(j.path("ingredients"));
        List<String> allergens = strings(j.path("allergens"));
        AiAnalysisLog log = logs.saveAndFlush(AiAnalysisLog.builder()
                .user(user).inputType(AiInputType.IMAGE).inputImageUrl(imageUrl).rawAiResponse(raw)
                .parsedCalories(num(j,"calories")).parsedProteinGram(num(j,"proteinGram"))
                .parsedCarbGram(num(j,"carbGram")).parsedFatGram(num(j,"fatGram"))
                .sugarGram(num(j,"sugarGram")).sodiumMg(num(j,"sodiumMg"))
                .confidence(confidence(j.get("confidence"))).mealType(text(j,"mealType",null))
                .estimatedPriceVnd(num(j,"estimatedPriceVnd")).modelName(model)
                .foodName(text(j,"foodName","Món ăn chưa xác định"))
                .source(AiAnalysisSource.AI).status(AiAnalysisStatus.SUCCESS)
                .startedAt(Instant.now()).completedAt(Instant.now())
                .enrichmentJson(json(Map.of("candidateFoods",candidates,"ingredients",ingredients,"allergens",allergens)))
                .build());
        String result = result(log);
        if (log.getConfidence().signum() == 0) {
            replies.send(profile, "Không nhận diện được món ăn trong ảnh. Vui lòng gửi ảnh món ăn rõ hơn hoặc chụp lại ở góc khác.");
            return;
        }
        if (user == null) { replies.send(profile,result+"\nLiên kết tài khoản để xác nhận và lưu bữa ăn."); return; }
        List<AiHealthWarning> warnings=healthWarnings.evaluate(user,log.getFoodName(),ingredients,allergens,log.getSugarGram(),log.getSodiumMg(),log.getParsedCarbGram(),log.getParsedProteinGram());
        if(!warnings.isEmpty()) result+="\n\nLưu ý sức khỏe:\n"+warnings.stream().map(w->"- "+w.message()).reduce((a,b)->a+"\n"+b).orElse("");
        cancel(profile);
        if(log.getConfidence().compareTo(threshold)<0){
            List<AiFoodCandidate> options=candidates.isEmpty()?List.of(new AiFoodCandidate(log.getFoodName(),log.getConfidence())):candidates;
            saveAction(profile,ChatbotActionType.MEAL_CLARIFICATION,new State(log.getId(),options));
            List<MessengerReplyService.QuickReply> quick=new ArrayList<>();
            for(int i=0;i<Math.min(3,options.size());i++) quick.add(q(shortName(options.get(i).foodName()),"MEAL_CANDIDATE_"+i));
            quick.add(q("Món khác","MEAL_OTHER"));
            replies.sendQuickReplies(profile,result+"\n\nĐộ tin cậy chưa cao. Đây là món nào?",quick);
        }else{
            saveAction(profile,ChatbotActionType.MEAL_CONFIRMATION,new State(log.getId(),List.of()));
            replies.sendQuickReplies(profile,result+"\n\nXác nhận để lưu bữa ăn?",confirmReplies());
        }
    }

    @Transactional
    public boolean handle(ChatbotProfile profile, MessengerMessage message){
        if(profile==null||profile.getUser()==null||message==null) return false;
        var found=active(profile); if(found.isEmpty()) return false;
        ChatbotPendingAction action=found.get();
        if(action.getExpiresAt()!=null&&!action.getExpiresAt().isAfter(Instant.now())){
            action.setStatus(ChatbotActionStatus.CANCELLED); actions.save(action);
            replies.send(profile,"Phiên xác nhận đã hết hạn. Vui lòng gửi lại ảnh."); return true;
        }
        String payload=message.quickReply()==null?null:message.quickReply().payload();
        String input=message.text()==null?null:message.text().trim();
        return action.getType()==ChatbotActionType.MEAL_CLARIFICATION
                ? clarify(profile,action,payload,input):confirm(profile,action,payload,input);
    }

    private boolean clarify(ChatbotProfile p,ChatbotPendingAction a,String payload,String input){
        State s=state(a); AiAnalysisLog log=logs.findByIdAndUserId(s.analysisId(),p.getUser().getId()).orElseThrow();
        String selected=null;
        if(payload!=null&&payload.startsWith("MEAL_CANDIDATE_")){
            try{int i=Integer.parseInt(payload.substring(15)); if(i>=0&&i<s.candidates().size()) selected=s.candidates().get(i).foodName();}catch(Exception ignored){}
        }else if("MEAL_OTHER".equals(payload)){ replies.send(p,"Hãy nhập tên món ăn đúng."); return true; }
        else if(input!=null&&!input.isBlank()) selected=input;
        if(selected==null||selected.isBlank()){ replies.send(p,"Vui lòng chọn gợi ý hoặc nhập tên món."); return true; }
        if(!selected.equalsIgnoreCase(log.getFoodName())){
            confirmedMeals.correct(log.getId(),p.getUser().getId(),selected,null,null,"LOW_CONFIDENCE_CLARIFICATION");
            log.setFoodName(selected.trim()); logs.saveAndFlush(log);
        }
        a.setType(ChatbotActionType.MEAL_CONFIRMATION); a.setPayloadJson(json(new State(log.getId(),List.of()))); actions.save(a);
        replies.sendQuickReplies(p,"Đã ghi nhận món “"+selected.trim()+"”. Xác nhận lưu?",confirmReplies()); return true;
    }

    private boolean confirm(ChatbotProfile p,ChatbotPendingAction a,String payload,String input){
        State s=state(a); String normalized=normalize(input);
        if("MEAL_CANCEL".equals(payload)||normalized.matches(".*\\b(huy|khong)\\b.*")){
            a.setStatus(ChatbotActionStatus.CANCELLED); actions.save(a); replies.send(p,"Đã hủy lưu bữa ăn."); return true;
        }
        if("MEAL_CONFIRM".equals(payload)||normalized.matches(".*\\b(xac nhan|dong y|ok|dung)\\b.*")){
            var meal=confirmedMeals.confirm(a.getId(),new ConfirmedMealApplicationService.Confirmation(s.analysisId(),null,null,null,null,true));
            replies.send(p,"Đã lưu bữa ăn “"+meal.getMealName()+"” vào NutriWallet."); return true;
        }
        if(input!=null&&!input.isBlank()){
            AiAnalysisLog log=logs.findByIdAndUserId(s.analysisId(),p.getUser().getId()).orElseThrow();
            confirmedMeals.correct(log.getId(),p.getUser().getId(),input,null,null,"USER_CORRECTION_BEFORE_CONFIRM");
            log.setFoodName(input); logs.saveAndFlush(log);
            replies.sendQuickReplies(p,"Đã sửa thành “"+input+"”. Xác nhận lưu?",confirmReplies());
        }else replies.sendQuickReplies(p,"Vui lòng xác nhận hoặc hủy.",confirmReplies());
        return true;
    }

    private ChatbotPendingAction saveAction(ChatbotProfile p,ChatbotActionType type,State state){
        return actions.save(ChatbotPendingAction.builder().chatbotProfile(p).type(type)
                .status(ChatbotActionStatus.AWAITING_CONFIRMATION).payloadJson(json(state))
                .expiresAt(Instant.now().plusSeconds(900)).build());
    }
    private Optional<ChatbotPendingAction> active(ChatbotProfile p){
        return actions.findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(p.getId(),List.of(ChatbotActionStatus.AWAITING_CONFIRMATION))
                .filter(a->a.getType()==ChatbotActionType.MEAL_CLARIFICATION||a.getType()==ChatbotActionType.MEAL_CONFIRMATION);
    }
    private void cancel(ChatbotProfile p){active(p).ifPresent(a->{a.setStatus(ChatbotActionStatus.CANCELLED);actions.save(a);});}
    private List<MessengerReplyService.QuickReply> confirmReplies(){return List.of(q("Xác nhận","MEAL_CONFIRM"),q("Hủy","MEAL_CANCEL"));}
    private MessengerReplyService.QuickReply q(String t,String p){return new MessengerReplyService.QuickReply(t,p);}
    private State state(ChatbotPendingAction a){try{return mapper.readValue(a.getPayloadJson(),State.class);}catch(Exception e){throw new IllegalStateException(e);}}
    private String json(Object v){try{return mapper.writeValueAsString(v);}catch(Exception e){throw new IllegalStateException(e);}}
    private BigDecimal num(JsonNode j,String f){JsonNode v=j.get(f);return v!=null&&v.isNumber()&&v.decimalValue().signum()>=0?v.decimalValue():BigDecimal.ZERO;}
    private BigDecimal confidence(JsonNode node){
        if(node==null||node.isNull()) return BigDecimal.valueOf(50);
        BigDecimal value;
        try{
            if(node.isNumber()) value=node.decimalValue();
            else {
                String raw=node.asText("").trim().replace("%","").replace(",",".");
                if(raw.isBlank()) return BigDecimal.valueOf(50);
                value=new BigDecimal(raw);
            }
        }catch(NumberFormatException ex){return BigDecimal.valueOf(50);}
        if(value.signum()<0) return BigDecimal.ZERO;
        if(value.compareTo(BigDecimal.ONE)<=0) value=value.multiply(BigDecimal.valueOf(100));
        return value.min(BigDecimal.valueOf(100)).stripTrailingZeros();
    }
    private String text(JsonNode j,String f,String d){JsonNode v=j.get(f);return v!=null&&!v.asText().isBlank()?v.asText().trim():d;}
    private List<String> strings(JsonNode n){if(!n.isArray())return List.of();List<String> r=new ArrayList<>();n.forEach(v->{if(!v.asText().isBlank()&&r.size()<50)r.add(v.asText());});return r;}
    private List<AiFoodCandidate> candidates(JsonNode n){if(!n.isArray())return List.of();List<AiFoodCandidate> r=new ArrayList<>();n.forEach(v->{if(r.size()<3&&v.hasNonNull("foodName"))r.add(new AiFoodCandidate(v.get("foodName").asText(),confidence(v.get("confidence"))));});return r;}
    private String result(AiAnalysisLog a){return "Kết quả nhận dạng:\n- Món: "+a.getFoodName()+"\n- Độ tin cậy: "+a.getConfidence()+"%\n- Calo: "+a.getParsedCalories()+" kcal\n- Protein: "+a.getParsedProteinGram()+"g\n- Carb: "+a.getParsedCarbGram()+"g\n- Fat: "+a.getParsedFatGram()+"g";}
    private String shortName(String v){return v.length()<=20?v:v.substring(0,20);}
    private String normalize(String v){return v==null?"":java.text.Normalizer.normalize(v.toLowerCase(Locale.ROOT),java.text.Normalizer.Form.NFD).replaceAll("\\p{M}","").replace('đ','d');}
    public record State(Long analysisId,List<AiFoodCandidate> candidates){}
}
