// const getSubscribersQuery = "SELECT id FROM subscribers WHERE active=true";
const getSubscribersQuery = "SELECT id FROM subscribers";
const getSubscribers = module.exports = (client, logger, callback) => {
  logger.info("Getting subscribers");

  client.query(
    getSubscribersQuery,
    [],
    (err, result) => {
      if (err) {
        logger.error(err);
        callback([]);
      }
      callback(result.rows);
    });

};
