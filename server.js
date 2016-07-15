// Main dependencies
const util = require('util');
var pg = require('pg').native;
var twitter = require('twit');
var TelegramBot = require('node-telegram-bot-api');

// Environment variables
var postgres_url = process.env.DATABASE_URL;
var telegram_token = process.env.TELEGRAM_TOKEN;

// Instances
var bot = new TelegramBot(
  telegram_token,
  {polling: true}
);

var twit = new twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// API
var subscribe = require('./lib/user/subscribe');
var unsubscribe = require('./lib/user/unsubscribe');
var getLastTweets = require('./lib/tweets/getlasttweets');

// Telegram command /start
bot.onText(/\/start/, function(msg, match) {
  var user = {
    id: msg.from.id,
    username: msg.from.username,
    first_name: msg.from.first_name,
    active: true,
    subscribed_at: new Date(msg.date * 1000)
  };

  pg.connect(postgres_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres (subscribe)');
      console.error(err);
      done();
      process.exit(-1);
    }

    subscribe(client, user, function(ok) {
      done();
      if(ok) {
        console.info('User', user.id, 'subscribed');
        var message = 'Сиз обуна бўлдингиз. Обунани бекор қилиш учун исталган вақтда /stop буйруғини юборишингиз мумкин.';
        bot.sendMessage(user.id, message);
      } else {
        console.info('Cannot subscribe user', user.id);
      }
    });

    getLastTweets(client, user, function(lastTweets) {
      console.info('Sending last 10 tweets to user', user.id);
      lastTweets.forEach(function (tweet) {
        bot.sendMessage(user.id, tweet.text);
      });
    });

  });

});

bot.onText(/\/stop/, function(msg, match) {
  var user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres (unsubscribe)');
      console.error(err);
      done();
      process.exit(-1);
    }

    unsubscribe(client, user, function(ok) {
      done();
      if(ok) {
        console.info('User', user.id, 'unsubscribed');
        var message = 'Обуна бекор қилинди. Қайта обуна бўлиш учун /start буйруғини юборинг.';
        bot.sendMessage(user.id, message);
      } else {
        console.info('Cannot unsubscribe user', user.id);
      }
    });

  });

});



var stream = twit.stream('statuses/filter', { track: 'uzb25' });
stream.on('connected', function(response) {
  console.info('Twitter client connected to stream');
});
stream.on('tweet', function(tweet) {
  var obj = {
    id: tweet.id,
    text: tweet.text,
    username: tweet.user.name,
    screenname: tweet.user.screen_name,
    location: tweet.user.location,
    avatar: tweet.user.profile_image_url,
    created_at: new Date(tweet.created_at)
  };
  saveTweet(pg, obj);
});

function saveTweet(pg, obj) {
  pg.connect(postgres_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres (filter)');
      console.error(err);
      done();
      process.exit(-1);
    }

    client.query(
      'INSERT INTO tweets (id, text, username, screenname, location, avatar, created_at) VALUES($1, $2, $3, $4, $5, $6, $7)',
      [obj.id, obj.text, obj.username, obj.screenname, obj.location, obj.avatar, obj.created_at],
      function(err, result) {
        if(err) {
          console.error(err);
          process.exit(-1);
        }
        done();
    });

  });
}

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
    console.log(tweetData.id);
  });
});
