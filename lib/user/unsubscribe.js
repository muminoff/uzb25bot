const updateQuery = "UPDATE subscribers SET active=false WHERE id=$1";
const unsubscribe = module.exports = (client, user, callback) => {
  console.log('Unsubscribing user', user.id);

  client.query(
    updateQuery,
    [user.id],
    (err, result) => {
      if (err) {
        console.error(err);
        callback(false);
      }
      callback(true);
    });

};
