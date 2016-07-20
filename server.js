// main modules
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(server);
const pg = require('pg').native;

// Environment variables
const postgres_url = process.env.DATABASE_URL;

io.sockets.on('connection', socket => {
  remote_addr = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.info('Socket connected', socket.id);
  console.info('Socket address', remote_addr);

  pg.connect(postgres_url, (err, client, done) => {

    if (err) {
      console.error('Cannot connect to Postgres (subscribe)');
      console.error(err);
      done();
      process.exit(-1);
    }

    getLastTweets(client, socket.id, lastTweets => {
      done();
      console.info('Sending last 10 tweets to user', socket.id);
      lastTweets.forEach(tweet => {
        io.sockets.emit('tweet', tweet);
      });
    });

  });

  socket.on('disconnect', () => {
    console.info('Socket disconnected', socket.id);
  });
});


// Postgres channel listener
const pgClient = new pg.Client(postgres_url);
pgClient.connect(err => {

  if (err) {
    console.error('Cannot connect to Postgres (pubsub)');
    console.error(err);
    process.exit(-1);
  }

  pgClient.query('LISTEN channel', (err, result) => {

    if (err) {
      console.error('Cannot listen to channel');
      process.exit(-1);
    }

    console.info('Postgres channel listener started');

  });

  pgClient.on('notification', data => {

    const tweetData = JSON.parse(data.payload);
    console.log('Got tweet', tweetData.id, 'now broadcasting');
    io.sockets.emit('tweet', tweetData);

  });
});

server.listen(process.env.PORT, () => {
  console.log('Server listening at %d ...', process.env.PORT);
});
