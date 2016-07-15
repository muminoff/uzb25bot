CREATE TABLE subscribers (
    id bigint NOT NULL,
    username text,
    first_name text,
    active boolean DEFAULT true,
    subscribed_at timestamp without time zone
);

