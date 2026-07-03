package com.nutricash.api.budget.entity;
import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.common.enums.BudgetAlertType;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor @Entity
@Table(name="budget_alerts", uniqueConstraints=@UniqueConstraint(name="uk_budget_alert_type", columnNames={"budget_id","alert_type"}))
public class BudgetAlert extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="budget_id",nullable=false) private Budget budget;
 @Enumerated(EnumType.STRING) @Column(name="alert_type",nullable=false,length=20) private BudgetAlertType alertType;
 @Column(name="sent_at",nullable=false) private Instant sentAt;
}