UPDATE activity_type SET active = FALSE WHERE id = 'constellation';

INSERT INTO activity_type(id, name, description, price_paise, active)
VALUES ('tarot', 'Tarot Cat Fortune', 'Choose one of nine AI-written fortune cards', 5900, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_paise = EXCLUDED.price_paise,
  active = TRUE;
