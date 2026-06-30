package com.nutricash.api.ai.service;

import com.nutricash.api.ai.config.AiQueueConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiJobPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publish(Long id) {
        rabbitTemplate.convertAndSend(AiQueueConfig.EXCHANGE, AiQueueConfig.ROUTING_KEY, id);
    }

 public void retry(Long id, int attempt, long delayMs) { rabbitTemplate.convertAndSend(AiQueueConfig.RETRY_EXCHANGE, "retry." + attempt, id, m->{m.getMessageProperties().setExpiration(Long.toString(delayMs));return m;}); }

    public void deadLetter(Long id) {
        rabbitTemplate.convertAndSend(AiQueueConfig.DLX, "failed", id);
    }
}
