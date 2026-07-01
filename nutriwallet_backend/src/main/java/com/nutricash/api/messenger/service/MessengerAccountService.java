package com.nutricash.api.messenger.service;

import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.messenger.dto.LinkAccountRequest;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.messenger.repository.ChatbotProfileRepository;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessengerAccountService {

    private final ChatbotProfileRepository chatbotProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public void linkAccount(SecurityUser securityUser, LinkAccountRequest request) {
        if (securityUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(securityUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ChatbotProfile profile = chatbotProfileRepository.findByGuestSessionCode(request.code().trim())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        profile.setUser(user);
        profile.setGuestSessionCode(null);
        profile.setLinkedAt(Instant.now());

        chatbotProfileRepository.save(profile);
        log.info("Successfully linked Messenger profile (PSID: {}) to user ID: {}", profile.getPsid(), user.getId());
    }

    @Transactional
    public void unlinkAccount(SecurityUser securityUser) {
        if (securityUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<ChatbotProfile> profiles = chatbotProfileRepository.findAllByUserId(securityUser.getId());
        for (ChatbotProfile profile : profiles) {
            profile.setUser(null);
            profile.setLinkedAt(null);
            // Sinh mã guest code mới đề phòng họ muốn liên kết lại
            profile.setGuestSessionCode("NW-" + generateRandomCode(6));
            chatbotProfileRepository.save(profile);
            log.info("Unlinked Messenger profile (PSID: {}) from user ID: {}", profile.getPsid(), securityUser.getId());
        }
    }

    private String generateRandomCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
