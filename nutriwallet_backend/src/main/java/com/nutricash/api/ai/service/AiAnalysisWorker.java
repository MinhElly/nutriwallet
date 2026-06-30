package com.nutricash.api.ai.service;

import com.nutricash.api.ai.config.AiQueueConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AiAnalysisWorker {
    private final AiAnalysisService service;

    @RabbitListener(queues = AiQueueConfig.QUEUE, containerFactory = "aiListenerFactory")
    public void consume(Long analysisLogId) {
        service.processJob(analysisLogId);
    }
}
