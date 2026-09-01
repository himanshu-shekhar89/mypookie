ALTER TABLE invitation ADD COLUMN provider_order_id VARCHAR(80) NULL;
ALTER TABLE invitation ADD COLUMN provider_payment_id VARCHAR(80) NULL;
ALTER TABLE invitation ADD COLUMN amount_paise INT NULL;
ALTER TABLE invitation ADD COLUMN payment_status VARCHAR(24) NULL;
CREATE INDEX idx_invitation_provider_order ON invitation(provider_order_id);
