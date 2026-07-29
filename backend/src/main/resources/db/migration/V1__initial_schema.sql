CREATE TABLE app_user (
  id VARCHAR(36) PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(160),
  role VARCHAR(24) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE activity_type (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  price_paise INT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  config_schema TEXT
);
CREATE TABLE bundle (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  price_paise INT NOT NULL,
  activity_ids TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE gift (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) NOT NULL,
  title VARCHAR(160) NOT NULL,
  recipient_name VARCHAR(160) NOT NULL,
  recipient_type VARCHAR(40) NOT NULL,
  occasion VARCHAR(80) NOT NULL,
  theme VARCHAR(80) NOT NULL,
  ambience VARCHAR(80) NOT NULL,
  blocks_json LONGTEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  total_paise INT NOT NULL,
  share_token VARCHAR(80) UNIQUE,
  scheduled_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gift_sender FOREIGN KEY (sender_id) REFERENCES app_user(id)
);
CREATE TABLE gift_order (
  id VARCHAR(36) PRIMARY KEY,
  gift_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  amount_paise INT NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  status VARCHAR(32) NOT NULL,
  provider_order_id VARCHAR(128),
  provider_payment_id VARCHAR(128),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_gift FOREIGN KEY (gift_id) REFERENCES gift(id),
  CONSTRAINT fk_order_sender FOREIGN KEY (sender_id) REFERENCES app_user(id)
);
INSERT INTO activity_type(id,name,description,price_paise) VALUES
('letter','Personal letter','A message they tap to unfold',2900),
('voice','Voice message','Record something only you can say',3900),
('flowers','E-flowers','A bouquet that blooms on screen',2900),
('quiz','Playful quiz','Normal or floating wrong answers',4900),
('wheel','Spin the wheel','Custom prizes and limited spins',4900),
('puzzle','Photo puzzle','Turn a memory into a puzzle',5900),
('memory','Memory lane','Photos, dates and little stories',7900),
('scratch','Scratch reveal','Hide a gift, photo or promise',3900),
('treasure','Treasure hunt','Clues leading to a surprise',7900),
('calendar','Unlock calendar','Timed messages and moments',9900),
('gift','Gift card','Wrap a real or custom voucher',2900);
INSERT INTO bundle(id,name,description,price_paise,activity_ids) VALUES
('romantic','Romantic surprise','A slow heartfelt story',24900,'["letter","voice","memory","quiz","flowers","gift"]'),
('birthday','Birthday adventure','Games surprises and a happy ending',27900,'["letter","puzzle","quiz","wheel","scratch","gift"]'),
('friend','Best friend forever','Shared lore and real appreciation',21900,'["voice","memory","quiz","puzzle","gift"]');
