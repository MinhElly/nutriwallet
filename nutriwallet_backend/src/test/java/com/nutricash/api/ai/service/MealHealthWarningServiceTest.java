package com.nutricash.api.ai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import com.nutricash.api.health.entity.*;
import com.nutricash.api.health.enums.HealthAllergenType;
import com.nutricash.api.health.repository.HealthProfileRepository;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MealHealthWarningServiceTest {
 @Mock HealthProfileRepository profiles;
 @InjectMocks MealHealthWarningService service;

 @Test void warnsForDeclaredAllergyAndFoodRestriction(){
  User user=User.builder().id(1L).fullName("User").email("u@test.com").build();
  HealthProfile profile=HealthProfile.builder().id(2L).user(user).consentGiven(true)
    .foodRestrictions("[\"đường\"]").build();
  profile.getAllergies().add(HealthProfileAllergy.builder().healthProfile(profile)
    .allergenType(HealthAllergenType.MILK).build());
  when(profiles.findByUserId(1L)).thenReturn(Optional.of(profile));

  var warnings=service.evaluate(user,"Trà sữa đường đen",List.of("sữa tươi","đường"),
    List.of(),BigDecimal.TEN,BigDecimal.ZERO,BigDecimal.TEN,BigDecimal.ONE);

  assertThat(warnings).extracting(v->v.ruleId())
    .contains("ALLERGY_MATCH_MILK","FOOD_RESTRICTION_MATCH");
  assertThat(warnings).allMatch(v->"HIGH".equals(v.severity()));
 }

 @Test void warnsForEggAllergyFromFoodNameWithoutAiIngredientList(){
  User user=User.builder().id(3L).fullName("User").email("egg@test.com").build();
  HealthProfile profile=HealthProfile.builder().id(4L).user(user).consentGiven(true).build();
  profile.getAllergies().add(HealthProfileAllergy.builder().healthProfile(profile)
    .allergenType(HealthAllergenType.EGG).build());
  when(profiles.findByUserId(3L)).thenReturn(Optional.of(profile));

  var warnings=service.evaluate(user,"Trứng chiên",List.of(),List.of(),
    BigDecimal.ZERO,BigDecimal.ZERO,BigDecimal.ZERO,BigDecimal.ZERO);

  assertThat(warnings).extracting(v->v.ruleId()).containsExactly("ALLERGY_MATCH_EGG");
  assertThat(warnings.get(0).message()).contains("trứng hoặc chế phẩm từ trứng");
 }

 @Test void doesNotMistakeOmeletteForSesameBecauseOfShortVietnameseAlias(){
  User user=User.builder().id(5L).fullName("User").email("sesame@test.com").build();
  HealthProfile profile=HealthProfile.builder().id(6L).user(user).consentGiven(true).build();
  profile.getAllergies().add(HealthProfileAllergy.builder().healthProfile(profile)
    .allergenType(HealthAllergenType.SESAME).build());
  when(profiles.findByUserId(5L)).thenReturn(Optional.of(profile));

  var warnings=service.evaluate(user,"Omelette",List.of(),List.of(),
    BigDecimal.ZERO,BigDecimal.ZERO,BigDecimal.ZERO,BigDecimal.ZERO);

  assertThat(warnings).isEmpty();
 }
}
