CREATE TABLE invitation (
  id VARCHAR(36) PRIMARY KEY,
  creator_id VARCHAR(36) NOT NULL,
  share_token VARCHAR(64) UNIQUE,
  status VARCHAR(20) NOT NULL,
  title VARCHAR(160) NOT NULL,
  tradition VARCHAR(40) NOT NULL,
  details_json LONGTEXT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL,
  updated_at TIMESTAMP(6) NOT NULL,
  CONSTRAINT fk_invitation_creator FOREIGN KEY (creator_id) REFERENCES app_user(id)
);
CREATE INDEX idx_invitation_creator_updated ON invitation(creator_id, updated_at);
