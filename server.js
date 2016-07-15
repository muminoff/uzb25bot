const util = require('util');
var pg = require('pg').native;
var twitter = require('twit');
var db_url = 'postgres://sardor@localhost/sardor';

var TelegramBot = require('node-telegram-bot-api');
var token = '256368416:AAFtbvYZIU8wfWPlgzoXmQV-s4dIF-_S9JY';
var bot = new TelegramBot(token, {polling: true});

// API
var subscribe = require('./lib/subscribe');

bot.onText(/\/start/, function(msg, match) {
  var user = {
    id: msg.from.id,
    username: msg.from.username,
    first_name: msg.from.first_name,
    active: true,
    subscribed_at: new Date(msg.date * 1000)
  };

  pg.connect(db_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres');
      done();
      process.exit(-1);
    }

    subscribe(client, user, function(ok) {
      if(ok) {
        console.info('User', user.id, 'subscribed');
      } else {
        console.info('Cannot subscribe user', user.id);
      }
    });

  });

});


function sendLastTweets(chat_id) {
  console.log(chat_id);
  pg.connect(db_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres');
      done();
      process.exit(-1);
    }

    client.query(
      'SELECT id, text, username, screenname, location, avatar, created_at FROM tweets ORDER by created_at DESC LIMIT 10',
      [],
      function(err, result) {
        if(err) {
          console.error(err);
          process.exit(-1);
        }
        done();
        result.rows.forEach(function(row) {
          var message = util.format(
              '%s (%s): %s', row.username, row.screenname, row.text);
          bot.sendMessage(chat_id, message);
        });
    });

  });
}

bot.onText(/\/stop/, function(msg, match) {
  var user = {
    id: msg.from.id,
  };
  unsubscribe(pg, user);
});

function unsubscribe(pg, user) {
  console.log(user);
  pg.connect(db_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres');
      done();
      process.exit(-1);
    }

    client.query(
      'UPDATE subscribers SET active=false WHERE id=$1',
      [user.id],
      function(err, result) {
        if(err) {
          console.error(err);
          process.exit(-1);
        }
        done();
    });

  });
}

var twit = new twitter({
  consumer_key: 'Tvx1WrOxvsHYz56fboflsLgjK',
  consumer_secret: 'FMm6crsw2t4pvnznUYKEGuZOAZgFs5eZt1J7v0a3tu42P1vWac',
  access_token: '27643060-1c9yeC2tnf5P35quVSciEepHOaBfzYuqcQFHD6Rw4',
  access_token_secret: 'baH9aDaKCxNzj4Hh9cIt8O93uCH8mTMd9O7tXH4bwZQa9'
});



var stream = twit.stream('statuses/filter', { track: 'sardor' });
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
  pg.connect(db_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres');
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

var pgClient = new pg.Client('postgres://sardor@localhost/sardor');
pgClient.connect(function(err) {
  if(err) {
    console.error('Cannot connect to Postgres');
    process.exit(-1);
  }
  
  pgClient.query('LISTEN channel', function(err, result) {
    if(err) {
      console.error('Cannot listen to channel');
      process.exit(-1);
    }
    console.info('Channel listener started');
  });

  pgClient.on('notification', function(data) {
    var tweetData = JSON.parse(data.payload);
    console.log(tweetData.id);
  });
});
