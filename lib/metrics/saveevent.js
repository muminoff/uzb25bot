const saveEventQuery = "INSERT INTO metrics (events) VALUES (jsonb_build_object($1::text, jsonb_build_object('time', (EXTRACT('EPOCH' FROM CURRENT_TIME) * 1000)::int4, 'command', $2::text))) ON CONFLICT (id) DO UPDATE SET events = metrics.events || jsonb_build_object($1::text, jsonb_build_object('time', (EXTRACT('EPOCH' FROM CURRENT_TIME) * 1000)::int4, 'command', $2::text))";
const saveEvent = module.exports = (client, logger, metrics, callback) => {
  logger.info('Saving', metrics.command, 'event for user', metrics.user_id);

  client.query(
    saveEventQuery,
    [metrics.user_id, metrics.command],
    (err, result) => {
      if (err) {
        logger.error(err);
        return callback(false);
      }
      return callback(true);
    });

};
