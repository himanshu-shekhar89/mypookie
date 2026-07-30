ALTER TABLE gift ADD COLUMN sender_name VARCHAR(80) NOT NULL DEFAULT 'Someone special';

CREATE TABLE gift_secret (
  id VARCHAR(36) PRIMARY KEY,
  gift_id VARCHAR(36) NOT NULL,
  block_instance_id VARCHAR(64) NOT NULL,
  ciphertext LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_gift_secret_block UNIQUE (gift_id, block_instance_id),
  CONSTRAINT fk_gift_secret_gift FOREIGN KEY (gift_id) REFERENCES gift(id)
);

INSERT INTO activity_type(id,name,description,price_paise)
VALUES ('song','If We Were a Song','Answer together and reveal the song of your bond',4900);
