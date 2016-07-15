CREATE FUNCTION new_tweet_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
  perform pg_notify('channel', json_build_object('id', NEW.id, 'text', NEW.text, 'username', NEW.username, 'screenname', NEW.screenname, 'location', NEW.location, 'avatar', NEW.avatar, 'created_at', NEW.created_at)::text);
  return NEW;
END;
$$;
