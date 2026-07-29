CREATE TABLE contribution_invite (
  id VARCHAR(36) PRIMARY KEY,
  gift_id VARCHAR(36) NOT NULL,
  token VARCHAR(80) NOT NULL UNIQUE,
  status VARCHAR(24) NOT NULL,
  claim_token VARCHAR(80) UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  claimed_at TIMESTAMP NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contribution_invite_gift FOREIGN KEY (gift_id) REFERENCES gift(id)
);

CREATE INDEX idx_contribution_invite_gift ON contribution_invite(gift_id);
