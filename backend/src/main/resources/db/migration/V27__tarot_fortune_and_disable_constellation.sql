UPDATE activity_type SET active = FALSE WHERE id = 'constellation';

INSERT INTO activity_type(id, name, description, price_paise, active)
VALUES ('tarot', 'Tarot Cat Fortune', 'Choose one of nine AI-written fortune cards', 5900, TRUE)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_paise = VALUES(price_paise),
  active = TRUE;
