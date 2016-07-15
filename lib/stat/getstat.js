const getStatQuery = "WITH post_count_stat AS (SELECT COUNT(id) AS total_posts FROM tweets), post_location_stat AS (SELECT location, COUNT(id) AS times FROM tweets GROUP BY location ORDER BY times DESC LIMIT 1), subscriber_count_stat AS (SELECT COUNT(id) AS total_subscribers FROM subscribers) SELECT json_build_object('total_posts', total_posts, 'top_place', location, 'total_subscribers', total_subscribers) AS stat FROM post_count_stat, post_location_stat, subscriber_count_stat";
var getStat = module.exports = function(client, user, callback) {
  console.log("Getting stat for user", user.id);

  client.query(
    getStatQuery,
    [],
    function(err, result) {
      if(err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows[0]);
  });

}
