// main modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var pg = require('pg').native;

// API
var getLastTweets = require('./lib/tweets/getlasttweets');

// Environment variables
var postgres_url = process.env.DATABASE_URL;

io.sockets.on('connection', function(socket) {
  remote_addr = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.info('Socket connected', socket.id);
  console.info('Socket address', remote_addr);

  pg.connect(postgres_url, function(err, client, done) {

    if(err) {
      console.error('Cannot connect to Postgres (subscribe)');
      console.error(err);
      done();
      process.exit(-1);
    }

    getLastTweets(client, socket.id, function(lastTweets) {
      console.info('Sending last 10 tweets to user', socket.id);
      lastTweets.forEach(function (tweet) {
        io.sockets.emit('tweet', tweet);
      });
    });

  });

  socket.on('disconnect', function() {
    console.info('Socket disconnected', socket.id);
  });
});


// Postgres channel listener
var pgClient = new pg.Client(postgres_url);
pgClient.connect(function(err) {

  if(err) {
    console.error('Cannot connect to Postgres (pubsub)');
    console.error(err);
    process.exit(-1);
  }
  
  pgClient.query('LISTEN channel', function(err, result) {

    if(err) {
      console.error('Cannot listen to channel');
      process.exit(-1);
    }

    console.info('Postgres channel listener started');

  });

  pgClient.on('notification', function(data) {

    var tweetData = JSON.parse(data.payload);
    console.log('Got tweet', tweetData.id, 'now broadcasting');
    io.sockets.emit('tweet', tweetData);

  });
});

server.listen(process.env.PORT, function() {
  console.log('Server listening at %d ...', process.env.PORT);
});
