CREATE VIEW rating AS
WITH
location_rating AS (
  SELECT json_agg(row_to_json(l)) AS location_rating FROM (
    SELECT count(id) AS posts, COALESCE(location, 'Ноаниқ ҳудуд') as location
    FROM tweets
    GROUP BY location
    ORDER BY posts DESC
    LIMIT 10) l),
user_rating AS (
  SELECT json_agg(row_to_json(u)) AS user_rating FROM (
    SELECT count(id) AS posts, screenname, username
    FROM tweets
    GROUP BY screenname, username
    ORDER BY posts DESC
    LIMIT 10) u)

SELECT * FROM location_rating, user_rating;
