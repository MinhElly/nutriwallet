package com.nutricash.api.health.entity;

import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.health.enums.HealthUserType;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity @Table(name = "health_classifications")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HealthClassification extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "health_profile_id", nullable = false, unique = true)
    private HealthProfile healthProfile;
    @Enumerated(EnumType.STRING) @Column(name = "primary_type", nullable = false, length = 40)
    private HealthUserType primaryType;
    @Lob @Column(name = "risk_flags_json", nullable = false, columnDefinition = "TEXT")
    private String riskFlagsJson;
    @Lob @Column(name = "explanations_json", nullable = false, columnDefinition = "TEXT")
    private String explanationsJson;
    @Column(name = "rule_version", nullable = false) private int ruleVersion;
    @Column(name = "evaluated_at", nullable = false) private Instant evaluatedAt;
}
