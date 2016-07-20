const getTweetsQuery = "SELECT * FROM last_tweets";
const getLastTweets = module.exports = (client, user, callback) => {
  console.log("Getting last tweets for user", user.id);

  client.query(
    getTweetsQuery,
    [],
    (err, result) => {
      if (err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows);
    });

};
