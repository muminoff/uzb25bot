const insertQuery = "INSERT INTO subscribers (id, username, first_name, active, subscribed_at) VALUES($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET active=$4, subscribed_at=$5";
const subscribe = module.exports = (client, logger, user, callback) => {
  logger.info('Subscribing user', user.id);

  client.query(
    insertQuery,
    [user.id, user.username, user.first_name, user.active, user.subscribed_at],
    (err, result) => {
      if (err) {
        logger.error(err);
        callback(false);
      }
      callback(true);
    });

};
