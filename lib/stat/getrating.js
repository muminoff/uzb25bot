const getRatingQuery = "SELECT * FROM rating";
var getRating = module.exports = function(client, user, callback) {
  console.log("Getting rating for user", user.id);

  client.query(
    getRatingQuery,
    [],
    function(err, result) {
      if (err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows);
    });

}
