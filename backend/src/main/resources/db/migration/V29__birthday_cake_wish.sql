INSERT INTO activity_type (id, name, description, price_paise, active)
VALUES ('birthdaycake', 'Birthday Cake Wish', 'Light candles, make a wish and cut a personalised cake', 5900, true)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_paise = VALUES(price_paise),
  active = TRUE;
