CREATE TABLE subscribers (
    id bigint PRIMARY KEY,
    username text,
    first_name text,
    active boolean DEFAULT true,
    subscribed_at timestamp without time zone
);

CREATE INDEX active_users_idx ON subscribers (active);
