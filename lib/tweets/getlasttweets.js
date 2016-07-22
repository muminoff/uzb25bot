const getTweetsQuery = "SELECT * FROM last_tweets";
const getLastTweets = module.exports = (client, logger, user, callback) => {
  logger.info("Getting last tweets for user", user.id);

  client.query(
    getTweetsQuery,
    [],
    (err, result) => {
      if (err) {
        logger.error(err);
        callback([]);
      }
      callback(result.rows);
    });

};
