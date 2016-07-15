const getRatingQuery = "SELECT screenname, COUNT(id) AS times FROM tweets GROUP BY screenname ORDER BY times DESC LIMIT 10";
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
