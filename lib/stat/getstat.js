const getStatQuery = "SELECT * FROM stat";
const getStat = module.exports = (client, logger, user, callback) => {
  logger.info("Getting stat for user", user.id);

  client.query(
    getStatQuery,
    [],
    (err, result) => {
      if (err) {
        logger.error(err);
        callback([]);
      }
      callback(result.rows[0]);
    });

};
