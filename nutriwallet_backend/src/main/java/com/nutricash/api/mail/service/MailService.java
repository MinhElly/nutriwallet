package com.nutricash.api.mail.service;

import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final String apiUrl;
    private final String from;

    public MailService(
            JavaMailSender mailSender,
            @Value("${app.api-url:${API_BASE_URL:${VITE_API_BASE_URL:http://localhost:${BACKEND_PORT:8080}/api}}}") String apiUrl,
            @Value("${app.mail.from:${MAIL_FROM:${MAIL_USERNAME:}}}") String from
    ) {
        this.mailSender = mailSender;
        this.apiUrl = apiUrl;
        this.from = from;
    }

    public void sendVerificationEmail(String to, String token) {
        try {
            String link = UriComponentsBuilder
                    .fromUriString(apiUrl)
                    .path("/auth/verify-email")
                    .queryParam("token", token)
                    .toUriString();

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Verify your NutriCashAI account</title>
                    </head>
                    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
                            <tr>
                                <td align="center">
                                    <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08);">
                                        <tr>
                                            <td style="background:#16a34a; padding:28px; text-align:center;">
                                                <h1 style="margin:0; color:#ffffff; font-size:26px;">NutriCashAI</h1>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:32px;">
                                                <h2 style="margin:0 0 16px; color:#111827; font-size:22px;">Verify your email address</h2>
                                                <p style="margin:0 0 16px; color:#4b5563; font-size:15px; line-height:1.6;">
                                                    Welcome to <strong>NutriCashAI</strong>! Thanks for creating an account.
                                                    Please verify your email address to activate your account.
                                                </p>
                                                <div style="text-align:center; margin:32px 0;">
                                                    <a href="{{VERIFY_LINK}}" style="background:#16a34a; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:10px; font-size:15px; font-weight:bold; display:inline-block;">
                                                        Verify my email
                                                    </a>
                                                </div>
                                                <p style="margin:24px 0 8px; color:#6b7280; font-size:13px; line-height:1.6;">
                                                    If the button does not work, copy and paste this link into your browser:
                                                </p>
                                                <p style="word-break:break-all; color:#16a34a; font-size:13px; line-height:1.6;">{{VERIFY_LINK}}</p>
                                                <p style="margin:28px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">
                                                    If you did not create this account, you can safely ignore this email.
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#f9fafb; padding:18px 32px; text-align:center; color:#9ca3af; font-size:12px;">
                                                &copy; 2026 NutriCashAI. All rights reserved.
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    """.replace("{{VERIFY_LINK}}", link);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            if (from != null && !from.isBlank()) {
                helper.setFrom(from);
            }

            helper.setTo(to);
            helper.setSubject("Verify your NutriCashAI account");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception exception) {
            log.error("Failed to send verification email to {} using apiUrl='{}' and from='{}'", to, apiUrl, from, exception);
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }
}
