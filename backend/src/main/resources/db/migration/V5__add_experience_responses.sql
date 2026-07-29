UPDATE activity_type SET active = FALSE WHERE id = 'heartcatch';
UPDATE activity_type SET name = 'Tap the Hearts' WHERE id = 'tapheart';

CREATE TABLE experience_response (
  id VARCHAR(36) PRIMARY KEY,
  gift_id VARCHAR(36) NOT NULL,
  block_id VARCHAR(40) NOT NULL,
  response_type VARCHAR(40) NOT NULL,
  contributor_name VARCHAR(80) NOT NULL,
  response_text LONGTEXT NOT NULL,
  photo_urls LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_response_gift FOREIGN KEY (gift_id) REFERENCES gift(id)
);

CREATE INDEX idx_response_gift_block ON experience_response(gift_id,block_id);
