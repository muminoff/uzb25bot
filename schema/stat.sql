CREATE VIEW stat AS
WITH post_count_stat AS (
  SELECT COUNT(id) AS total_posts FROM tweets),
subscriber_count_stat AS (
  SELECT COUNT(id) AS total_subscribers FROM subscribers WHERE active = true),
unsubscriber_count_stat AS (
  SELECT COUNT(id) AS total_unsubscribers FROM subscribers WHERE active = false),
daily_posts AS (
  SELECT COUNT(id) AS posts, extract(day from created_at) as created FROM tweets GROUP BY created ORDER BY created ASC),
avg_posts_per_day AS (
  SELECT ROUND(AVG(daily_posts.posts), 1) AS average_posts_per_day FROM daily_posts),
daily_subscribers AS (
  SELECT COUNT(id) AS subscribers, extract(day from subscribed_at) as subscribed FROM subscribers GROUP BY subscribed ORDER BY subscribed ASC),
avg_subscribers_per_day AS (
  SELECT ROUND(AVG(daily_subscribers.subscribers), 1) AS average_subscribers_per_day FROM daily_subscribers)

SELECT json_build_object(
  'total_posts', total_posts,
  'total_subscribers', total_subscribers,
  'total_unsubscribers', total_unsubscribers,
  'avg_posts_per_day', average_posts_per_day,
  'avg_subscribers_per_day', average_subscribers_per_day) as stat
FROM post_count_stat, subscriber_count_stat, unsubscriber_count_stat, avg_posts_per_day, avg_subscribers_per_day;
