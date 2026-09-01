CREATE TABLE invitation_bulk_request (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  quantity INT NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  message VARCHAR(1000) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  admin_note VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_invitation_bulk_status_created ON invitation_bulk_request(status, created_at);
