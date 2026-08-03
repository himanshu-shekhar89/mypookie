CREATE TABLE gift_open_session (
  id VARCHAR(36) PRIMARY KEY,
  gift_id VARCHAR(36) NOT NULL,
  client_session_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_open_session_gift FOREIGN KEY (gift_id) REFERENCES gift(id),
  CONSTRAINT uk_open_session_gift_client UNIQUE (gift_id, client_session_id)
);

CREATE INDEX idx_open_session_gift ON gift_open_session(gift_id);
