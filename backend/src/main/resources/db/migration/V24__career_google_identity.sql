alter table career_application add column firebase_uid varchar(180);
create index idx_career_application_firebase_uid on career_application(firebase_uid);
