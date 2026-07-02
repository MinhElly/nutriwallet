package com.nutricash.api.ai.service;

import com.nutricash.api.ai.config.AiQueueConfig;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AiAnalysisWorker {
    private static final Logger log = LoggerFactory.getLogger(AiAnalysisWorker.class);
    private final AiAnalysisService service;

    @RabbitListener(queues = AiQueueConfig.QUEUE, containerFactory = "aiListenerFactory")
    public void consume(Long analysisLogId) {
        log.info("Received AI analysis job from RabbitMQ: id={}", analysisLogId);
        try {
            service.processJob(analysisLogId);
            log.info("Successfully finished processing AI analysis job: id={}", analysisLogId);
        } catch (Throwable t) {
            log.error("Fatal error consuming AI analysis job: id={}", analysisLogId, t);
            try {
                service.handleJobProcessingFailure(analysisLogId, t);
            } catch (Throwable inner) {
                log.error("Failed to mark job as failed in database: id={}", analysisLogId, inner);
            }
        }
    }
}
