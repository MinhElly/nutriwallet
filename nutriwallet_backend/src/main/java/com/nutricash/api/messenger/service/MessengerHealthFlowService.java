package com.nutricash.api.messenger.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.common.enums.*;
import com.nutricash.api.health.dto.*;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.service.*;
import com.nutricash.api.messenger.dto.MessengerMessage;
import com.nutricash.api.messenger.entity.*;
import com.nutricash.api.messenger.repository.ChatbotPendingActionRepository;
import com.nutricash.api.setting.dto.UpdateUserSettingRequest;
import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.setting.service.UserSettingService;
import com.nutricash.api.user.repository.UserRepository;
import java.math.BigDecimal;
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
    private final UserSettingService settings;
    private final UserRepository users;
    private final MessengerReplyService replies;
    private final ObjectMapper mapper = new ObjectMapper();

    @Transactional
    public void offerInitial(ChatbotProfile profile) {
        if (profile == null || profile.getUser() == null) return;
        var health = profiles.toResponse(profiles.getOrCreate(profile.getUser()));
        if (health.firstCompletedAt() != null || active(profile).isPresent()) return;
        replies.sendQuickReplies(profile, "Để cá nhân hóa cảnh báo, bạn có muốn thiết lập hồ sơ sức khỏe?",
                List.of(q("Bắt đầu", "HEALTH_START_INITIAL"), q("Để sau", "HEALTH_LATER")));
    }

    @Transactional
    public boolean handle(ChatbotProfile profile, MessengerMessage message) {
        if (profile == null || profile.getUser() == null || message == null) return false;
        String payload = message.quickReply() == null ? null : message.quickReply().payload();
        String text = clean(message.text());
        if ("HEALTH_LATER".equals(payload)) { replies.send(profile, "Bạn có thể nhắn “hồ sơ sức khỏe” để bắt đầu sau."); return true; }
        if (payload != null && payload.startsWith("HEALTH_NO_CHANGE_")) {
            profiles.markAssessmentCompleted(profile.getUser(), type(payload.substring(17)));
            replies.send(profile, "Đã ghi nhận hồ sơ không thay đổi."); return true;
        }
        if (payload != null && payload.startsWith("HEALTH_START_")) { start(profile, type(payload.substring(13))); return true; }
        if (text != null && normalize(text).matches(".*(ho so suc khoe|danh gia suc khoe|cap nhat suc khoe).*")) {
            var h=profiles.toResponse(profiles.getOrCreate(profile.getUser()));
            start(profile, h.firstCompletedAt()==null?AssessmentType.INITIAL:AssessmentType.QUARTERLY); return true;
        }
        var pending=active(profile); if(pending.isEmpty()) return false;
        var action=pending.get();
        if(action.getExpiresAt()!=null&&!action.getExpiresAt().isAfter(Instant.now())){
            action.setStatus(ChatbotActionStatus.CANCELLED);actions.save(action);replies.send(profile,"Phiên cập nhật đã hết hạn.");return true;
        }
        return advance(profile,action,read(action),payload,text);
    }

    private void start(ChatbotProfile p, AssessmentType type){
        cancelActive(p);
        var health=profiles.toResponse(profiles.getOrCreate(p.getUser()));
        UserSetting us=settings.getOrCreateUserSetting(p.getUser());
        var session=assessments.start(p.getUser(),new StartAssessmentRequest(AssessmentChannel.MESSENGER,type));
        State s=new State(session.id(),session.version(),type,"CONSENT",false,health.firstCompletedAt()!=null,
                p.getUser().getFullName(),us.getAge(),us.getGender(),us.getHeight(),us.getWeight(),us.getActivityLevel(),us.getDiet(),us.getGoal(),
                new ArrayList<>(health.conditions()),new ArrayList<>(health.allergies()),new ArrayList<>(health.foodRestrictions()),
                health.nextQuarterlyReviewAt()!=null?AssessmentType.QUARTERLY:health.nextAnnualReviewAt()!=null?AssessmentType.ANNUAL:null);
        actions.save(ChatbotPendingAction.builder().chatbotProfile(p).type(ChatbotActionType.HEALTH_ASSESSMENT)
                .status(ChatbotActionStatus.AWAITING_CONFIRMATION).payloadJson(write(s)).expiresAt(Instant.now().plusSeconds(604800)).build());
        replies.sendQuickReplies(p,"Thông tin tự khai chỉ dùng để cá nhân hóa và không thay thế chẩn đoán y khoa. Bạn đồng ý tiếp tục?",
                List.of(q("Đồng ý","HEALTH_CONSENT_YES"),q("Không đồng ý","HEALTH_CONSENT_NO")));
    }

    private boolean advance(ChatbotProfile p,ChatbotPendingAction a,State s,String payload,String text){
        switch(s.step){
            case "CONSENT" -> {
                if("HEALTH_CONSENT_NO".equals(payload)){completeWithoutConsent(p,a,s);replies.send(p,"Đã ghi nhận không cung cấp thông tin.");return true;}
                if(!"HEALTH_CONSENT_YES".equals(payload))return choices(p,"Vui lòng chọn đồng ý hoặc không đồng ý.",List.of(q("Đồng ý","HEALTH_CONSENT_YES"),q("Không đồng ý","HEALTH_CONSENT_NO")));
                s=s.copy("NAME");s.consent=true;persist(a,s);return ask(p,"Tên hiển thị của bạn là gì?",s.updating);
            }
            case "NAME" -> { if(update(payload))return ask(p,"Vui lòng nhập tên mới.",false);if(!keep(payload)){if(text==null)return ask(p,"Vui lòng nhập tên.",s.updating);s.name=text;} return next(p,a,s,"AGE","Bạn bao nhiêu tuổi?",true); }
            case "AGE" -> { if(update(payload))return ask(p,"Vui lòng nhập tuổi mới.",false);if(!keep(payload)){Integer v=integer(text,1,120);if(v==null)return ask(p,"Tuổi phải là số từ 1 đến 120.",s.updating);s.age=v;} s.step="GENDER";persist(a,s);return genderPrompt(p,s.updating); }
            case "GENDER" -> {
                if(update(payload))return genderPrompt(p,false);
                if(!keep(payload)){String v=switch(String.valueOf(payload)){case "HEALTH_GENDER_MALE"->"MALE";case "HEALTH_GENDER_FEMALE"->"FEMALE";case "HEALTH_GENDER_OTHER"->"OTHER";default->null;};if(v==null)return genderPrompt(p,s.updating);s.gender=v;}
                return next(p,a,s,"HEIGHT","Chi?u cao c?a b?n (cm)?",true);
            }
            case "HEIGHT" -> { if(update(payload))return ask(p,"Vui lòng nhập chiều cao mới (cm).",false);if(!keep(payload)){Double v=decimal(text,50,250);if(v==null)return ask(p,"Chiều cao phải từ 50 đến 250 cm.",s.updating);s.height=v;} return next(p,a,s,"WEIGHT","Cân nặng của bạn (kg)?",true); }
            case "WEIGHT" -> { if(update(payload))return ask(p,"Vui lòng nhập cân nặng mới (kg).",false);if(!keep(payload)){Double v=decimal(text,10,500);if(v==null)return ask(p,"Cân nặng phải từ 10 đến 500 kg.",s.updating);s.weight=v;} s.step="ACTIVITY";persist(a,s);return activityPrompt(p,s.updating); }
            case "ACTIVITY" -> {
                if(update(payload))return activityPrompt(p,false);
                if(!keep(payload)){String v=switch(String.valueOf(payload)){case "HEALTH_ACTIVITY_LOW"->"LOW";case "HEALTH_ACTIVITY_MODERATE"->"MODERATE";case "HEALTH_ACTIVITY_HIGH"->"HIGH";default->null;};if(v==null)return activityPrompt(p,s.updating);s.activity=v;}
                return next(p,a,s,"DIET","Chế độ ăn kiêng của bạn? Nhập “không” nếu không có.",true);
            }
            case "DIET" -> { if(update(payload))return ask(p,"Vui lòng nhập chế độ ăn mới.",false);if(!keep(payload)){if(text==null)return ask(p,"Vui lòng nhập chế độ ăn hoặc “không”.",s.updating);s.diet=none(text)?null:text;} return next(p,a,s,"GOAL","Mục tiêu sử dụng: giảm cân, tăng cân, giữ dáng, kiểm soát sức khỏe...?",true); }
            case "GOAL" -> { if(update(payload))return ask(p,"Vui lòng nhập mục tiêu mới.",false);if(!keep(payload)){if(text==null)return ask(p,"Vui lòng nhập mục tiêu sử dụng.",s.updating);s.goal=text;} return nextMedical(p,a,s,"CONDITIONS","bệnh nền"); }
            case "CONDITIONS" -> {
                if(update(payload))return ask(p,"Nhập bệnh nền mới, cách nhau bằng dấu phẩy. Trả lời “không” để giữ nguyên bệnh án hiện tại.",false);
                if(!keep(payload)&&!(s.updating&&text!=null&&none(text))){if(text==null)return askMedical(p,"bệnh nền",s.updating);s.conditions=new ArrayList<>(parseConditions(text));}
                return nextMedical(p,a,s,"ALLERGIES","dị ứng thực phẩm");
            }
            case "ALLERGIES" -> {
                if(update(payload))return ask(p,"Nhập dị ứng mới, cách nhau bằng dấu phẩy. Trả lời “không” để giữ nguyên thông tin hiện tại.",false);
                if(!keep(payload)&&!(s.updating&&text!=null&&none(text))){if(text==null)return askMedical(p,"dị ứng thực phẩm",s.updating);s.allergies=new ArrayList<>(parseAllergies(text));}
                return nextMedical(p,a,s,"RESTRICTIONS","thực phẩm hoặc chế độ cần hạn chế");
            }
            case "RESTRICTIONS" -> {
                if(update(payload))return ask(p,"Nhập hạn chế mới. Trả lời “không” để giữ nguyên thông tin hiện tại.",false);
                if(!keep(payload)&&!(s.updating&&text!=null&&none(text))){if(text==null)return askMedical(p,"thực phẩm hoặc chế độ cần hạn chế",s.updating);s.restrictions=new ArrayList<>(parseList(text));}
                s.step="SCHEDULE";persist(a,s);return schedulePrompt(p,s.updating);
            }
            case "SCHEDULE" -> {
                if(update(payload))return schedulePrompt(p,false);
                if(keep(payload)&&s.updating&&s.reviewSchedule!=null){s.step="CONFIRM";persist(a,s);return confirmPrompt(p,s);}
                if("HEALTH_SCHEDULE_QUARTERLY".equals(payload))s.reviewSchedule=AssessmentType.QUARTERLY;
                else if("HEALTH_SCHEDULE_ANNUAL".equals(payload))s.reviewSchedule=AssessmentType.ANNUAL;
                else return schedulePrompt(p,false);
                s.step="CONFIRM";persist(a,s);return confirmPrompt(p,s);
            }
            case "CONFIRM" -> {
                if("HEALTH_RESTART".equals(payload)){start(p,s.type);return true;}
                if(!"HEALTH_CONFIRM".equals(payload))return confirmPrompt(p,s);
                complete(p,a,s);replies.send(p,"Đã cập nhật hồ sơ và đặt lịch đánh giá lại "+(s.reviewSchedule==AssessmentType.QUARTERLY?"hàng quý.":"hàng năm."));return true;
            }
            default -> {a.setStatus(ChatbotActionStatus.FAILED);actions.save(a);return true;}
        }
    }

    private boolean next(ChatbotProfile p,ChatbotPendingAction a,State s,String step,String prompt,boolean allowKeep){s.step=step;persist(a,s);return ask(p,prompt,allowKeep&&s.updating);}
    private boolean nextMedical(ChatbotProfile p,ChatbotPendingAction a,State s,String step,String section){s.step=step;persist(a,s);return askMedical(p,section,s.updating);}
    private boolean askMedical(ChatbotProfile p,String section,boolean updating){
        String prompt="Bạn có "+section+" nào? Nhập cách nhau bằng dấu phẩy hoặc “không”.";
        if(updating)replies.sendQuickReplies(p,"Bạn có muốn cập nhật "+section+"? Nếu giữ nguyên hoặc trả lời “không”, dữ liệu hiện tại sẽ được bảo toàn.",
                List.of(q("Cập nhật","HEALTH_UPDATE"),q("Giữ nguyên","HEALTH_KEEP")));
        else replies.send(p,prompt);
        return true;
    }
    private boolean ask(ChatbotProfile p,String prompt,boolean keep){if(keep)replies.sendQuickReplies(p,prompt,List.of(q("Cập nhật","HEALTH_UPDATE"),q("Giữ nguyên","HEALTH_KEEP")));else replies.send(p,prompt);return true;}
    private boolean choices(ChatbotProfile p,String prompt,List<MessengerReplyService.QuickReply> q){replies.sendQuickReplies(p,prompt,q);return true;}
    private boolean genderPrompt(ChatbotProfile p,boolean keep){if(keep)return choices(p,"Bạn có muốn cập nhật giới tính?",List.of(q("Cập nhật","HEALTH_UPDATE"),q("Giữ nguyên","HEALTH_KEEP")));return choices(p,"Giới tính của bạn?",List.of(q("Nam","HEALTH_GENDER_MALE"),q("Nữ","HEALTH_GENDER_FEMALE"),q("Khác","HEALTH_GENDER_OTHER")));}
    private boolean activityPrompt(ChatbotProfile p,boolean keep){if(keep)return choices(p,"Bạn có muốn cập nhật mức độ vận động?",List.of(q("Cập nhật","HEALTH_UPDATE"),q("Giữ nguyên","HEALTH_KEEP")));return choices(p,"Mức độ vận động?",List.of(q("Ít vận động","HEALTH_ACTIVITY_LOW"),q("Vừa phải","HEALTH_ACTIVITY_MODERATE"),q("Nhiều","HEALTH_ACTIVITY_HIGH")));}
    private boolean schedulePrompt(ChatbotProfile p,boolean keep){if(keep)return choices(p,"Bạn có muốn cập nhật lịch đánh giá lại?",List.of(q("Cập nhật","HEALTH_UPDATE"),q("Giữ nguyên","HEALTH_KEEP")));return choices(p,"Bạn muốn được nhắc đánh giá lại hồ sơ theo lịch nào?",List.of(q("Hàng quý","HEALTH_SCHEDULE_QUARTERLY"),q("Hàng năm","HEALTH_SCHEDULE_ANNUAL")));}
    private boolean confirmPrompt(ChatbotProfile p,State s){return choices(p,summary(s),List.of(q("Xác nhận lưu","HEALTH_CONFIRM"),q("Làm lại","HEALTH_RESTART")));}

    private void complete(ChatbotProfile p,ChatbotPendingAction a,State s){
        p.getUser().setFullName(s.name.trim()); users.save(p.getUser());
        settings.updateUserSetting(p.getUser(),new UpdateUserSettingRequest(s.gender,s.weight,s.height,s.goal,s.age,s.diet,s.activity,null,null,null,null,null,null,null));
        var req=new UpdateHealthProfileRequest(true,s.conditions,s.allergies,s.restrictions,null);
        assessments.complete(p.getUser(),s.sessionId,new CompleteAssessmentRequest(req,s.sessionVersion));
        profiles.setReviewSchedule(p.getUser(),s.reviewSchedule);
        a.setStatus(ChatbotActionStatus.COMPLETED);actions.save(a);
    }
    private void completeWithoutConsent(ChatbotProfile p,ChatbotPendingAction a,State s){assessments.complete(p.getUser(),s.sessionId,new CompleteAssessmentRequest(new UpdateHealthProfileRequest(false,List.of(),List.of(),List.of(),null),s.sessionVersion));a.setStatus(ChatbotActionStatus.COMPLETED);actions.save(a);}
    private void persist(ChatbotPendingAction a,State s){Map<String,Object> answers=mapper.convertValue(s,new TypeReference<>(){});var updated=assessments.update(a.getChatbotProfile().getUser(),s.sessionId,new UpdateAssessmentRequest(s.step,answers,s.sessionVersion));s.sessionVersion=updated.version();a.setPayloadJson(write(s));actions.save(a);}
    private Optional<ChatbotPendingAction> active(ChatbotProfile p){return actions.findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(p.getId(),List.of(ChatbotActionStatus.AWAITING_CONFIRMATION,ChatbotActionStatus.PROCESSING)).filter(a->a.getType()==ChatbotActionType.HEALTH_ASSESSMENT);}
    private void cancelActive(ChatbotProfile p){active(p).ifPresent(a->{a.setStatus(ChatbotActionStatus.CANCELLED);actions.save(a);});}
    private State read(ChatbotPendingAction a){try{return mapper.readValue(a.getPayloadJson(),State.class);}catch(Exception e){throw new IllegalStateException("Invalid health state",e);}}
    private String write(Object v){try{return mapper.writeValueAsString(v);}catch(Exception e){throw new IllegalStateException(e);}}
    private AssessmentType type(String v){try{return AssessmentType.valueOf(v);}catch(Exception e){return AssessmentType.INITIAL;}}
    private boolean keep(String p){return "HEALTH_KEEP".equals(p);}
    private boolean update(String p){return "HEALTH_UPDATE".equals(p);}
    private String clean(String v){return v==null||v.isBlank()?null:v.trim();}
    private String normalize(String v){return java.text.Normalizer.normalize(v.toLowerCase(Locale.ROOT),java.text.Normalizer.Form.NFD).replaceAll("\\p{M}","").replace('\u0111','d');}
    private boolean none(String v){return normalize(v).matches(".*\\b(khong|none|no)\\b.*");}
    private Integer integer(String v,int min,int max){try{int n=Integer.parseInt(v);return n>=min&&n<=max?n:null;}catch(Exception e){return null;}}
    private Double decimal(String v,double min,double max){try{double n=Double.parseDouble(v.replace(',','.'));return n>=min&&n<=max?n:null;}catch(Exception e){return null;}}
    private List<String> parseList(String v){if(none(v))return List.of();return Arrays.stream(v.split(",")).map(String::trim).filter(x->!x.isBlank()).distinct().limit(20).toList();}
    private List<HealthConditionInput> parseConditions(String v){if(none(v))return List.of();String n=normalize(v);List<HealthConditionInput> o=new ArrayList<>();if(n.contains("tieu duong"))o.add(new HealthConditionInput(HealthConditionType.DIABETES,null));if(n.contains("huyet ap"))o.add(new HealthConditionInput(HealthConditionType.HYPERTENSION,null));if(n.contains("than"))o.add(new HealthConditionInput(HealthConditionType.KIDNEY_DISEASE,null));if(n.contains("tim"))o.add(new HealthConditionInput(HealthConditionType.CARDIOVASCULAR,null));if(o.isEmpty())o.add(new HealthConditionInput(HealthConditionType.OTHER,v));return o;}
    private List<HealthAllergyInput> parseAllergies(String v){if(none(v))return List.of();String n=normalize(v);List<HealthAllergyInput> o=new ArrayList<>();Map<String,HealthAllergenType> m=Map.of("dau phong",HealthAllergenType.PEANUT,"sua",HealthAllergenType.MILK,"trung",HealthAllergenType.EGG,"hai san",HealthAllergenType.SEAFOOD,"dau nanh",HealthAllergenType.SOY,"lua mi",HealthAllergenType.WHEAT,"me",HealthAllergenType.SESAME);m.forEach((k,t)->{if(n.contains(k)&&o.stream().noneMatch(x->x.type()==t))o.add(new HealthAllergyInput(t,null));});if(o.isEmpty())o.add(new HealthAllergyInput(HealthAllergenType.OTHER,v));return o;}
    private String summary(State s){return "Xác nhận hồ sơ:\n- Tên: "+s.name+"\n- Tuổi: "+s.age+"\n- Giới tính: "+s.gender+"\n- Chiều cao/cân nặng: "+s.height+" cm / "+s.weight+" kg\n- Vận động: "+s.activity+"\n- Chế độ ăn: "+orNone(s.diet)+"\n- Mục tiêu: "+orNone(s.goal)+"\n- Bệnh nền: "+list(s.conditions)+"\n- Dị ứng: "+list(s.allergies)+"\n- Hạn chế: "+list(s.restrictions)+"\n- Đánh giá lại: "+(s.reviewSchedule==AssessmentType.QUARTERLY?"Hàng quý":"Hàng năm");}
    private String orNone(String v){return v==null||v.isBlank()?"Khong":v;}
    private String list(Collection<?> v){return v==null||v.isEmpty()?"Khong":v.toString();}
    private MessengerReplyService.QuickReply q(String t,String p){return new MessengerReplyService.QuickReply(t,p);}

    public static class State {
        public Long sessionId; public long sessionVersion; public AssessmentType type; public String step; public boolean consent; public boolean updating;
        public String name; public Integer age; public String gender; public Double height; public Double weight; public String activity; public String diet; public String goal;
        public List<HealthConditionInput> conditions=new ArrayList<>(); public List<HealthAllergyInput> allergies=new ArrayList<>(); public List<String> restrictions=new ArrayList<>(); public AssessmentType reviewSchedule;
        public State(){}
        State(Long id,long version,AssessmentType type,String step,boolean consent,boolean updating,String name,Integer age,String gender,Double height,Double weight,String activity,String diet,String goal,List<HealthConditionInput> conditions,List<HealthAllergyInput> allergies,List<String> restrictions,AssessmentType schedule){this.sessionId=id;this.sessionVersion=version;this.type=type;this.step=step;this.consent=consent;this.updating=updating;this.name=name;this.age=age;this.gender=gender;this.height=height;this.weight=weight;this.activity=activity;this.diet=diet;this.goal=goal;this.conditions=conditions;this.allergies=allergies;this.restrictions=restrictions;this.reviewSchedule=schedule;}
        State copy(String step){this.step=step;return this;}
    }
}
