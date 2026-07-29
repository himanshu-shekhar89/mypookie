CREATE TABLE coupon (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  discount_type VARCHAR(16) NOT NULL,
  discount_value INT NOT NULL,
  max_discount_paise INT NULL,
  min_order_paise INT NOT NULL DEFAULT 0,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE gift_order ADD COLUMN coupon_code VARCHAR(40) NULL;
ALTER TABLE gift_order ADD COLUMN discount_paise INT NOT NULL DEFAULT 0;

INSERT INTO coupon(id,code,discount_type,discount_value,max_discount_paise,min_order_paise,usage_limit,used_count,active)
VALUES
('coupon-pookie10','POOKIE10','PERCENT',10,NULL,0,NULL,0,TRUE),
('coupon-firstgift','FIRSTGIFT','PERCENT',15,15000,0,NULL,0,TRUE),
('coupon-love50','LOVE50','FIXED',5000,NULL,0,NULL,0,TRUE);
