CREATE TABLE career_campaign (
  id VARCHAR(40) PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  default_discount_percent INT NOT NULL DEFAULT 10,
  default_commission_paise INT NOT NULL DEFAULT 1000,
  monthly_earning_cap_paise INT NOT NULL DEFAULT 10000000,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO career_campaign (id, title, summary, active, default_discount_percent, default_commission_paise, monthly_earning_cap_paise)
VALUES ('social-promotional', 'Social media promotional partner', 'Share mypookie with your Instagram or Snapchat community and earn from every verified purchase made with your personal coupon.', TRUE, 10, 1000, 10000000);

CREATE TABLE career_application (
  id VARCHAR(40) PRIMARY KEY,
  campaign_id VARCHAR(40) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(180) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  social_handle VARCHAR(100) NOT NULL,
  screenshot_url VARCHAR(1000) NOT NULL,
  audience_size INT,
  pitch VARCHAR(700),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  coupon_id VARCHAR(40),
  admin_note VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_career_campaign FOREIGN KEY (campaign_id) REFERENCES career_campaign(id),
  CONSTRAINT fk_career_coupon FOREIGN KEY (coupon_id) REFERENCES coupon(id)
);

CREATE INDEX idx_career_application_status ON career_application(status);
CREATE INDEX idx_career_application_email ON career_application(email);
