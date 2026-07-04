package com.nutricash.api.messenger.service;
import com.nutricash.api.common.enums.ChatbotMessageType;
import com.nutricash.api.messenger.entity.*;
import com.nutricash.api.messenger.repository.ChatbotMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;
@Service @RequiredArgsConstructor @Slf4j
public class MessengerReplyService {
 private final ChatbotMessageRepository messages;
 private final RestTemplate restTemplate = new RestTemplate();
 @Value("${app.messenger.page-access-token:}") private String token;
 public boolean send(ChatbotProfile profile,String text){
  if(token==null||token.isBlank()){ log.warn("Messenger token is not configured for PSID {}",profile.getPsid()); return false; }
  try{
   String url="https://graph.facebook.com/v19.0/me/messages?access_token="+token;
   restTemplate.postForObject(url,Map.of("recipient",Map.of("id",profile.getPsid()),"message",Map.of("text",text)),String.class);
   messages.save(ChatbotMessage.builder().chatbotProfile(profile).type(ChatbotMessageType.TEXT).messageText(text).isFromUser(false).build());
   return true;
  }catch(Exception e){ log.error("Messenger delivery failed for PSID {}",profile.getPsid(),e); return false; }
 }
 public boolean sendQuickReplies(ChatbotProfile profile,String text,List<QuickReply> quickReplies){
  List<QuickReply> safe=quickReplies==null?List.of():quickReplies.stream().limit(13).toList();
  if(token==null||token.isBlank()){ log.warn("Messenger token is not configured for PSID {}",profile.getPsid()); return false; }
  try{
   String url="https://graph.facebook.com/v19.0/me/messages?access_token="+token;
   List<Map<String,Object>> items=safe.stream().map(q->Map.<String,Object>of("content_type","text","title",q.title(),"payload",q.payload())).toList();
   restTemplate.postForObject(url,Map.of("recipient",Map.of("id",profile.getPsid()),"message",Map.of("text",text,"quick_replies",items)),String.class);
   messages.save(ChatbotMessage.builder().chatbotProfile(profile).type(ChatbotMessageType.TEXT).messageText(text).isFromUser(false).build());
   return true;
  }catch(Exception e){ log.error("Messenger quick reply delivery failed for PSID {}",profile.getPsid(),e); return false; }
 }
 public record QuickReply(String title,String payload) {}
}
