package com.nutricash.api.ai.entity;
import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
@Entity @Table(name="ai_analysis_corrections") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AiAnalysisCorrection extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="ai_analysis_log_id",nullable=false) private AiAnalysisLog analysisLog;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @Lob @Column(name="original_output",columnDefinition="LONGTEXT") private String originalOutput;
 @Column(name="corrected_food",length=255) private String correctedFood;
 @Column(name="corrected_portion",length=100) private String correctedPortion;
 @Lob @Column(name="corrected_toppings",columnDefinition="TEXT") private String correctedToppings;
 @Column(length=500) private String reason;
 @Column(name="corrected_at",nullable=false) private Instant correctedAt;
}
