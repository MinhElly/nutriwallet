package com.nutricash.api.config;

import java.util.Properties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender(
            @Value("${spring.mail.host:${MAIL_HOST:smtp.gmail.com}}") String host,
            @Value("${spring.mail.port:${MAIL_PORT:587}}") int port,
            @Value("${spring.mail.username:${MAIL_USERNAME:}}") String username,
            @Value("${spring.mail.password:${MAIL_PASSWORD:}}") String password,
            @Value("${spring.mail.properties.mail.smtp.connectiontimeout:${MAIL_CONNECTION_TIMEOUT:5000}}") int connectionTimeout,
            @Value("${spring.mail.properties.mail.smtp.timeout:${MAIL_TIMEOUT:5000}}") int timeout,
            @Value("${spring.mail.properties.mail.smtp.writetimeout:${MAIL_WRITE_TIMEOUT:5000}}") int writeTimeout
    ) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password == null ? null : password.replace(" ", ""));

        Properties properties = sender.getJavaMailProperties();
        properties.put("mail.transport.protocol", "smtp");
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.connectiontimeout", String.valueOf(connectionTimeout));
        properties.put("mail.smtp.timeout", String.valueOf(timeout));
        properties.put("mail.smtp.writetimeout", String.valueOf(writeTimeout));
        properties.put("mail.debug", "false");

        return sender;
    }
}
