package com.nutricash.api.messenger.service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

public final class ChatbotTextRules {
    private static final Set<String> EXACT_CODE_REQUESTS = Set.of(
            "ma", "code", "ma web", "ma lien ket", "ma ket noi", "lay ma", "xin ma", "ma cua toi");

    private ChatbotTextRules() {}

    public static String normalize(String text) {
        if (text == null) return "";
        return Normalizer.normalize(text.toLowerCase(Locale.ROOT).replace('đ', 'd'), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ").trim();
    }

    public static boolean asksForLinkCode(String text) {
        String value = normalize(text);
        return EXACT_CODE_REQUESTS.contains(value) || value.contains("code lien ket")
                || value.contains("code ket noi") || value.contains("link code")
                || value.contains("connect code") || value.contains("lien ket roi");
    }
}
