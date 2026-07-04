package com.nutricash.api.health;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.health.entity.*;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.repository.HealthClassificationRepository;
import com.nutricash.api.health.service.HealthClassificationService;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HealthClassificationServiceTest {
    private HealthClassificationRepository repository;
    private HealthClassificationService service;

    @BeforeEach
    void setup() {
        repository = mock(HealthClassificationRepository.class);
        when(repository.findByHealthProfileId(anyLong())).thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        service = new HealthClassificationService(repository);
    }

    @Test
    void generalWhenNoRiskIsReported() {
        HealthProfile profile = profile();
        HealthClassification result = service.classify(profile);
        assertEquals(HealthUserType.GENERAL, result.getPrimaryType());
        assertTrue(service.toResponse(result).riskFlags().isEmpty());
    }

    @Test
    void chronicConditionCreatesExplainableFlag() {
        HealthProfile profile = profile();
        profile.getConditions().add(HealthProfileCondition.builder().healthProfile(profile)
                .conditionType(HealthConditionType.DIABETES).build());
        HealthClassification result = service.classify(profile);
        assertEquals(HealthUserType.CHRONIC_CONDITION, result.getPrimaryType());
        assertTrue(service.toResponse(result).riskFlags().contains(HealthRiskFlag.DIABETES_REPORTED));
        assertEquals("CONDITION_DIABETES", service.toResponse(result).explanations().get(0).ruleId());
    }

    @Test
    void allergyTakesPrimaryPrecedenceButKeepsConditionFlag() {
        HealthProfile profile = profile();
        profile.getConditions().add(HealthProfileCondition.builder().healthProfile(profile)
                .conditionType(HealthConditionType.HYPERTENSION).build());
        profile.getAllergies().add(HealthProfileAllergy.builder().healthProfile(profile)
                .allergenType(HealthAllergenType.SEAFOOD).build());
        HealthClassification result = service.classify(profile);
        assertEquals(HealthUserType.ALLERGY_SENSITIVE, result.getPrimaryType());
        assertTrue(service.toResponse(result).riskFlags().containsAll(
                List.of(HealthRiskFlag.HYPERTENSION_REPORTED, HealthRiskFlag.ALLERGY_REPORTED)));
    }

    private HealthProfile profile() {
        return HealthProfile.builder().id(10L).conditions(new ArrayList<>()).allergies(new ArrayList<>()).build();
    }
}
