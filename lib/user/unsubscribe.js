const updateQuery = "UPDATE subscribers SET active=false WHERE id=$1";
var unsubscribe = module.exports = function(client, user, callback) {
  console.log('Unsubscribing user', user.id);

  client.query(
    updateQuery,
    [user.id],
    function(err, result) {
      if(err) {
        console.error(err);
        callback(false);
      }
      callback(true);
  });

}
