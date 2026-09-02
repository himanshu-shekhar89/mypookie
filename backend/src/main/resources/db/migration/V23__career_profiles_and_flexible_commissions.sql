ALTER TABLE career_application
  ADD COLUMN phone VARCHAR(30) NULL,
  ADD COLUMN social_profile_url VARCHAR(1000) NULL,
  MODIFY COLUMN email VARCHAR(180) NULL,
  MODIFY COLUMN screenshot_url VARCHAR(1000) NULL;

ALTER TABLE career_campaign
  ADD COLUMN default_commission_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
  ADD COLUMN default_commission_percent INT NOT NULL DEFAULT 0;

ALTER TABLE coupon
  ADD COLUMN commission_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
  ADD COLUMN commission_percent INT NOT NULL DEFAULT 0;
