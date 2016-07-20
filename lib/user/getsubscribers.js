const getSubscribersQuery = "SELECT id FROM subscribers WHERE active=true";
const getSubscribers = module.exports = (client, callback) => {

  client.query(
    getSubscribersQuery,
    [],
    (err, result) => {
      if (err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows);
    });

};
