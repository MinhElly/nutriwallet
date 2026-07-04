package com.nutricash.api.health.entity;

import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.health.enums.HealthAllergenType;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "health_profile_allergies")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HealthProfileAllergy extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "health_profile_id", nullable = false)
    private HealthProfile healthProfile;
    @Enumerated(EnumType.STRING) @Column(name = "allergen_type", nullable = false, length = 40)
    private HealthAllergenType allergenType;
    @Column(name = "custom_value", length = 255) private String customValue;
}
