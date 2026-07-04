package com.nutricash.api.health.entity;

import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity @Table(name = "health_profiles")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HealthProfile extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    @Column(name = "consent_given", nullable = false)
    private boolean consentGiven;
    @Lob @Column(name = "food_restrictions", columnDefinition = "TEXT")
    private String foodRestrictions;
    @Column(name = "first_completed_at") private Instant firstCompletedAt;
    @Column(name = "last_reviewed_at") private Instant lastReviewedAt;
    @Column(name = "next_quarterly_review_at") private Instant nextQuarterlyReviewAt;
    @Column(name = "next_annual_review_at") private Instant nextAnnualReviewAt;
    @Version @Column(name = "profile_version", nullable = false)
    private long profileVersion;
    @Builder.Default
    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HealthProfileCondition> conditions = new ArrayList<>();
    @Builder.Default
    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HealthProfileAllergy> allergies = new ArrayList<>();
    @OneToOne(mappedBy = "healthProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private HealthClassification classification;
}
