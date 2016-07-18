CREATE VIEW stat AS
WITH post_count_stat AS (
  SELECT COUNT(id) AS total_posts FROM tweets),
subscriber_count_stat AS (
  SELECT COUNT(id) AS total_subscribers FROM subscribers WHERE active=true)

SELECT json_build_object(
  'total_posts', total_posts,
  'total_subscribers', total_subscribers) AS stat
FROM post_count_stat, subscriber_count_stat;
