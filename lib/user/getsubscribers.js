const getSubscribersQuery = "SELECT id FROM subscribers WHERE active=true";
var getSubscribers = module.exports = function(client, callback) {

  client.query(
    getSubscribersQuery,
    [],
    function(err, result) {
      if (err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows);
    });

}
