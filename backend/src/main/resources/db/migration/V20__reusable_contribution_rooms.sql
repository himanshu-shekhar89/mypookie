CREATE TABLE contribution_claim (
  id VARCHAR(36) PRIMARY KEY,
  invite_id VARCHAR(36) NOT NULL,
  claim_token VARCHAR(80) NOT NULL UNIQUE,
  status VARCHAR(24) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contribution_claim_invite FOREIGN KEY (invite_id) REFERENCES contribution_invite(id)
);

CREATE INDEX idx_contribution_claim_invite ON contribution_claim(invite_id);
CREATE INDEX idx_contribution_claim_status_expiry ON contribution_claim(status, expires_at);

UPDATE contribution_invite
SET status = 'ACTIVE', claim_token = NULL, claimed_at = NULL
WHERE status IN ('CREATED', 'CLAIMED') AND expires_at > CURRENT_TIMESTAMP;
