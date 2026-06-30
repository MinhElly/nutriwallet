package com.nutricash.api.ai.config;

import java.util.Map;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiQueueConfig {
    public static final String EXCHANGE = "ai.analysis.exchange";
    public static final String QUEUE = "ai.analysis.queue";
    public static final String ROUTING_KEY = "ai.analysis";
    public static final String RETRY_EXCHANGE = "ai.analysis.retry.exchange";
    public static final String DLX = "ai.analysis.dlx";
    public static final String DLQ = "ai.analysis.dlq";

    @Bean
    DirectExchange analysisExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    @Bean
    DirectExchange retryExchange() {
        return new DirectExchange(RETRY_EXCHANGE, true, false);
    }

    @Bean
    DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX, true, false);
    }

    @Bean
    Queue analysisQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    @Bean
    Binding analysisBinding(Queue analysisQueue, DirectExchange analysisExchange) {
        return BindingBuilder.bind(analysisQueue).to(analysisExchange).with(ROUTING_KEY);
    }

    @Bean
    Queue retryQueue1() {
        return retryQueue(1);
    }

    @Bean
    Queue retryQueue2() {
        return retryQueue(2);
    }

    @Bean
    Queue retryQueue3() {
        return retryQueue(3);
    }

    private Queue retryQueue(int attempt) {
        return QueueBuilder.durable("ai.analysis.retry." + attempt)
                .withArguments(Map.of("x-dead-letter-exchange", EXCHANGE,
                        "x-dead-letter-routing-key", ROUTING_KEY))
                .build();
    }

    @Bean
    Binding retryBinding1(Queue retryQueue1, DirectExchange retryExchange) {
        return retryBinding(retryQueue1, retryExchange, 1);
    }

    @Bean
    Binding retryBinding2(Queue retryQueue2, DirectExchange retryExchange) {
        return retryBinding(retryQueue2, retryExchange, 2);
    }

    @Bean
    Binding retryBinding3(Queue retryQueue3, DirectExchange retryExchange) {
        return retryBinding(retryQueue3, retryExchange, 3);
    }

    private Binding retryBinding(Queue queue, DirectExchange exchange, int attempt) {
        return BindingBuilder.bind(queue).to(exchange).with("retry." + attempt);
    }

    @Bean
    Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }

    @Bean
    Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with("failed");
    }

    @Bean
    JacksonJsonMessageConverter rabbitMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    SimpleRabbitListenerContainerFactory aiListenerFactory(ConnectionFactory connectionFactory,
            JacksonJsonMessageConverter converter, @Value("${app.ai.worker.prefetch:1}") int prefetch) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(converter);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(1);
        factory.setPrefetchCount(prefetch);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
