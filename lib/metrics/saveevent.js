const saveEventQuery = "INSERT INTO metrics (events) VALUES (jsonb_build_object((EXTRACT('EPOCH' FROM CURRENT_TIME) * 1000)::int4, jsonb_build_object('user', '$1', 'command', '$2'))) ON CONFLICT (id) DO UPDATE SET events = metrics.events || jsonb_build_object((EXTRACT('EPOCH' FROM CURRENT_TIME) * 1000)::int4, jsonb_build_object('user', '$1', 'command', '$2'))";
const saveEvent = module.exports = (client, logger, obj, callback) => {
  logger.info('Saving', obj.commmand, 'event for user', obj.user_id);

  client.query(
    saveEventQuery,
    [obj.user_id, obj.command],
    (err, result) => {
      if (err) {
        logger.error(err);
        callback(false);
      }
      callback(true);
    });

};
