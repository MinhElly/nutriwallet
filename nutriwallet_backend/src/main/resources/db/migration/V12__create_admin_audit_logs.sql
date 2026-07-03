CREATE TABLE admin_audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    actor_user_id BIGINT NOT NULL,
    target_user_id BIGINT NULL,
    action VARCHAR(80) NOT NULL,
    details VARCHAR(1000) NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_admin_audit_actor (actor_user_id),
    INDEX idx_admin_audit_target (target_user_id),
    INDEX idx_admin_audit_created (created_at)
);