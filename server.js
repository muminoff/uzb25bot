// Main modules
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(server);
const pg = require('pg').native;

// Environment variables
const postgres_url = process.env.DATABASE_URL;

// API
const logger = require('./logger');
const getLastTweets = require('./lib/tweets/getlasttweets');

io.sockets.on('connection', socket => {
  remote_addr = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  logger.info('Socket connected', socket.id);
  logger.info('Socket address', remote_addr);

  pg.connect(postgres_url, (err, client, done) => {

    if (err) {
      logger.error('Cannot connect to Postgres (subscribe)');
      logger.error(err);
      done();
      process.exit(-1);
    }

    getLastTweets(client, socket.id, lastTweets => {
      done();
      logger.info('Sending last 10 tweets to user', socket.id);
      lastTweets.forEach(tweet => {
        io.sockets.emit('tweet', tweet);
      });
    });

  });

  socket.on('disconnect', () => {
    logger.info('Socket disconnected', socket.id);
  });
});


// Postgres channel listener
const pgClient = new pg.Client(postgres_url);
pgClient.connect(err => {

  if (err) {
    logger.error('Cannot connect to Postgres (pubsub)');
    logger.error(err);
    process.exit(-1);
  }

  pgClient.query('LISTEN channel', (err, result) => {

    if (err) {
      logger.error('Cannot listen to channel');
      process.exit(-1);
    }

    logger.info('Postgres channel listener started');

  });

  pgClient.on('notification', data => {

    const tweetData = JSON.parse(data.payload);
    logger.info('Got tweet', tweetData.id, 'now broadcasting');
    io.sockets.emit('tweet', tweetData);

  });
});

server.listen(process.env.PORT, () => {
  logger.info('Server listening at %d ...', process.env.PORT);
});
