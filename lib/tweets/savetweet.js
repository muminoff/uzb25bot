const saveTweetQuery = "INSERT INTO tweets (id, text, username, screenname, location, avatar, created_at) VALUES($1, $2, $3, $4, $5, $6, $7)";
const saveTweet = module.exports = (client, logger, tweet, callback) => {
  logger.info('Saving tweet', tweet.id);

  client.query(
    saveTweetQuery,
    [tweet.id, tweet.text, tweet.username, tweet.screenname, tweet.location, tweet.avatar, tweet.created_at],
    (err, result) => {
      if (err) {
        logger.error(err);
        callback(false);
      }
      callback(true);
    });

};
