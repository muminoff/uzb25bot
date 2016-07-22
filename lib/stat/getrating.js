const getRatingQuery = "SELECT * FROM rating";
const getRating = module.exports = (client, logger, user, callback) => {
  logger.info("Getting rating for user", user.id);

  client.query(
    getRatingQuery,
    [],
    (err, result) => {
      if (err) {
        logger.error(err);
        callback([]);
      }
      callback(result.rows);
    });

};
