ALTER TABLE budgets ADD COLUMN daily_amount DECIMAL(19,4) NULL AFTER amount;

UPDATE budgets SET daily_amount = CASE period
    WHEN 'DAILY' THEN amount
    WHEN 'WEEKLY' THEN amount / 7
    WHEN 'MONTHLY' THEN amount / DAY(LAST_DAY(start_date))
    ELSE amount END
WHERE daily_amount IS NULL;

ALTER TABLE budgets MODIFY daily_amount DECIMAL(19,4) NOT NULL;
ALTER TABLE user_settings ADD COLUMN current_budget_id BIGINT NULL;

UPDATE user_settings us SET current_budget_id = (
    SELECT b.id FROM budgets b WHERE b.user_id = us.user_id AND b.active = TRUE
    ORDER BY b.end_date ASC, b.id DESC LIMIT 1
);

INSERT INTO budgets (user_id, amount, daily_amount, period, start_date, end_date,
                     warning_threshold_percent, active, created_at, updated_at)
SELECT us.user_id, us.monthly_budget,
       us.monthly_budget / DAY(LAST_DAY(CURRENT_DATE)), 'MONTHLY',
       DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), LAST_DAY(CURRENT_DATE),
       80, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM user_settings us
WHERE us.current_budget_id IS NULL AND us.monthly_budget > 0
  AND NOT EXISTS (SELECT 1 FROM budgets b WHERE b.user_id = us.user_id AND b.active = TRUE);

UPDATE user_settings us SET current_budget_id = (
    SELECT b.id FROM budgets b WHERE b.user_id = us.user_id AND b.active = TRUE
    ORDER BY b.end_date ASC, b.id DESC LIMIT 1
) WHERE us.current_budget_id IS NULL;

UPDATE budgets b
JOIN user_settings us ON us.user_id = b.user_id
SET b.active = FALSE
WHERE b.active = TRUE AND us.current_budget_id IS NOT NULL AND b.id <> us.current_budget_id;

ALTER TABLE user_settings ADD CONSTRAINT fk_user_settings_current_budget
    FOREIGN KEY (current_budget_id) REFERENCES budgets(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX uk_user_settings_current_budget ON user_settings(current_budget_id);
