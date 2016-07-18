const getRatingQuery = "WITH location_rating AS (SELECT json_agg(row_to_json(l)) AS location_rating FROM (SELECT count(id) AS posts, location FROM tweets GROUP BY location ORDER BY posts DESC LIMIT 10) l), user_rating AS (SELECT json_agg(row_to_json(u)) AS user_rating FROM (SELECT count(id) AS posts, screenname, username FROM tweets GROUP BY screenname, username ORDER BY posts DESC LIMIT 10) u) SELECT * FROM location_rating, user_rating";
var getRating = module.exports = function(client, user, callback) {
  console.log("Getting rating for user", user.id);

  client.query(
    getRatingQuery,
    [],
    function(err, result) {
      if(err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows);
  });

}
