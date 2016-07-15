CREATE TABLE tweets (
    id bigint NOT NULL,
    text text,
    username text,
    screenname text,
    location text,
    avatar text,
    created_at timestamp without time zone
);

CREATE TRIGGER trig_new_tweet AFTER INSERT ON tweets FOR EACH ROW EXECUTE PROCEDURE new_tweet_notify();
