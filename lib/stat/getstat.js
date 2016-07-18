const getStatQuery = "SELECT * FROM stat";
var getStat = module.exports = function(client, user, callback) {
  console.log("Getting stat for user", user.id);

  client.query(
    getStatQuery,
    [],
    function(err, result) {
      if(err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows[0]);
  });

}
