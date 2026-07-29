INSERT INTO activity_type(id,name,description,price_paise) VALUES
('video','Video note','Record or upload a retro-style video',5900),
('thisorthat','This or that','Fast little choices about your story',3900),
('emoji','Emoji decoder','Guess the memory hidden in symbols',3900),
('heartcatch','Catch the hearts','A tiny reflex game with a prize',3900);

UPDATE activity_type
SET name = 'Celebration scene',
    description = 'Elegant full-screen light, petals and sparkles'
WHERE id = 'flowers';
