alter table career_application add column if not exists firebase_uid varchar(180);
create index if not exists idx_career_application_firebase_uid on career_application(firebase_uid);
