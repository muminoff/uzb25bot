CREATE TABLE subscribers (
    id bigint PRIMARY KEY,
    username text,
    first_name text,
    active boolean DEFAULT true,
    subscribed_at timestamp without time zone
);

CREATE INDEX active_users_idx ON subscribers (active);

CREATE VIEW active_users AS
SELECT id, username, first_name, subscribed_at FROM subscribers 
WHERE active=true ORDER BY subscribed_at DESC;

CREATE VIEW inactive_users AS
SELECT id, username, first_name, subscribed_at FROM subscribers 
WHERE active=false ORDER BY subscribed_at DESC;
