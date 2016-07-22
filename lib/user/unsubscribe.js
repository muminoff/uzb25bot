const updateQuery = "UPDATE subscribers SET active=false WHERE id=$1";
const unsubscribe = module.exports = (client, logger, user, callback) => {
  logger.info('Unsubscribing user', user.id);

  client.query(
    updateQuery,
    [user.id],
    (err, result) => {
      if (err) {
        logger.error(err);
        callback(false);
      }
      callback(true);
    });

};
