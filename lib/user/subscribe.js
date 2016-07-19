const insertQuery = "INSERT INTO subscribers (id, username, first_name, active, subscribed_at) VALUES($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET active=$4, subscribed_at=$5";
var subscribe = module.exports = function(client, user, callback) {
  console.log('Subscribing user', user.id);

  client.query(
    insertQuery,
    [user.id, user.username, user.first_name, user.active, user.subscribed_at],
    function(err, result) {
      if (err) {
        console.error(err);
        callback(false);
      }
      callback(true);
    });

}
