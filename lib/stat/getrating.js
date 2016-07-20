const getRatingQuery = "SELECT * FROM rating";
const getRating = module.exports = (client, user, callback) => {
  console.log("Getting rating for user", user.id);

  client.query(
    getRatingQuery,
    [],
    (err, result) => {
      if (err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows);
    });

};
