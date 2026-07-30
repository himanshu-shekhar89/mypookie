ALTER TABLE bundle ADD COLUMN recipient_type VARCHAR(24) NOT NULL DEFAULT 'Other';

UPDATE bundle SET recipient_type='Lover' WHERE id='romantic';
UPDATE bundle SET recipient_type='Friend' WHERE id='friend';
UPDATE bundle SET recipient_type='Other', name='Birthday spotlight', description='Games surprises and a happy ending for anyone', price_paise=22900 WHERE id='birthday';

INSERT INTO bundle(id,name,description,price_paise,activity_ids,recipient_type) VALUES
('lover-date','Our perfect date','A playful invitation that ends with a real plan together',16900,'["playlist","countdowninvite","wheel","gift","flowers"]','Lover'),
('lover-distance','Closer to you','Voice video and little moments for when distance feels too big',22900,'["video","playlist","countdownus","calendar","letter"]','Lover'),
('friend-chaos','Certified chaos','Confessions roulette and ridiculous best-friend surprises',17900,'["wouldrather","neverhave","truthdare","slots","fortune"]','Friend'),
('friend-birthday','Bestie birthday blast','Photos games and group wishes for their loudest birthday yet',28900,'["video","memory","puzzle","tapheart","groupboard","flowers"]','Friend'),
('parents-thanks','Everything you gave me','A warm thank-you told through words memories and a thoughtful gift',17900,'["letter","voice","memory","flowers","gift"]','Parents'),
('parents-memory','Our family album','A beautiful family story with photos milestones and music',24900,'["video","memory","puzzle","growthring","playlist"]','Parents'),
('parents-celebrate','Celebrate Mom and Dad','Messages from everyone a glowing reveal and a plan to celebrate',19900,'["groupboard","video","flowers","gift","countdowninvite"]','Parents'),
('sibling-bestie','Partners since forever','Childhood memories inside jokes and rarely-said appreciation',21900,'["voice","memory","quiz","matchpair","gift"]','Sibling'),
('sibling-nostalgia','Back to our childhood','Retro photos puzzles decoded memories and a shared soundtrack',20900,'["memory","puzzle","emoji","roast","playlist"]','Sibling'),
('sibling-roast','Roast reveal repeat','Loving sibling rivalry with games roasts and mystery prizes',17900,'["neverhave","truthdare","roast","slots","mysterybox"]','Sibling'),
('other-appreciation','You matter to me','A thoughtful bundle for mentors cousins and special people',21900,'["letter","voice","memory","groupboard","flowers"]','Other'),
('other-celebration','The celebration box','A lively mix of video games reveals and a final gift',22900,'["video","wheel","slots","scratch","flowers","gift"]','Other');
