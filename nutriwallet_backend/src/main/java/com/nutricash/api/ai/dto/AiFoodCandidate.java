package com.nutricash.api.ai.dto;
import java.math.BigDecimal;
public record AiFoodCandidate(String foodName, BigDecimal confidence) {}
