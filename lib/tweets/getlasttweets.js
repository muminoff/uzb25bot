const getTweetsQuery = "SELECT id, text, username, screenname, location, avatar, created_at FROM tweets ORDER by created_at DESC LIMIT 10";
var getLastTweets = module.exports = function(client, user, callback) {
  console.log("Getting last tweets for user", user.id);

  client.query(
    getTweetsQuery,
    [],
    function(err, result) {
      if(err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows);
  });

}
