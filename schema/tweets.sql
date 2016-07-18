CREATE TABLE tweets (
    id bigint NOT NULL,
    text text,
    username text,
    screenname text,
    location text,
    avatar text,
    created_at timestamp without time zone
);

CREATE INDEX usernames_idx ON tweets (username, screenname);
CREATE INDEX locations_idx ON tweets (location);

CREATE TRIGGER trig_new_tweet AFTER INSERT ON tweets FOR EACH ROW EXECUTE PROCEDURE new_tweet_notify();

CREATE VIEW last_tweets AS
SELECT id, text, username, screenname, location, avatar, created_at FROM tweets, pg_sleep(2) ORDER by created_at DESC LIMIT 10;
