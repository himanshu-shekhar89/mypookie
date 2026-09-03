CREATE TABLE IF NOT EXISTS tarot_fortune_pool (
  id INT PRIMARY KEY,
  fortunes_json LONGTEXT NOT NULL,
  used_count INT NOT NULL DEFAULT 0,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO activity_type(id, name, description, price_paise, active)
VALUES ('drawtogether', 'Draw Together', 'Draw the same prompt and compare your creations', 5900, TRUE)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_paise = VALUES(price_paise),
  active = TRUE;
