const getStatQuery = "SELECT * FROM stat";
const getStat = module.exports = (client, user, callback) => {
  console.log("Getting stat for user", user.id);

  client.query(
    getStatQuery,
    [],
    (err, result) => {
      if (err) {
        console.error(err);
        callback([]);
      }
      callback(result.rows[0]);
    });

};
