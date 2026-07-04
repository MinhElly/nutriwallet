package com.nutricash.api.health.entity;

import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity @Table(name = "health_assessment_sessions")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HealthAssessmentSession extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private AssessmentChannel channel;
    @Enumerated(EnumType.STRING) @Column(name = "assessment_type", nullable = false, length = 20) private AssessmentType assessmentType;
    @Column(name = "current_step", nullable = false, length = 50) private String currentStep;
    @Lob @Column(name = "draft_json", nullable = false, columnDefinition = "TEXT") private String draftJson;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private AssessmentStatus status;
    @Version @Column(nullable = false) private long version;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "completed_at") private Instant completedAt;
}
