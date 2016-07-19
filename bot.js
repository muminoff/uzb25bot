// Main dependencies
const util = require('util');
var pg = require('pg').native;
var twitter = require('twit');
var TelegramBot = require('node-telegram-bot-api');

// Environment variables
var postgres_url = process.env.DATABASE_URL;
var telegram_token = process.env.TELEGRAM_TOKEN;
var hashtags = process.env.HASHTAGS || 'uzb25, mustaqillik, dilizhori';

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
var saveTweet = require('./lib/tweets/savetweet');
var getSubscribers = require('./lib/user/getsubscribers');
var getStat = require('./lib/stat/getstat');
var getRating = require('./lib/stat/getrating');

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
      done();
      console.info('Sending last 10 tweets to user', user.id);
      lastTweets.forEach(function (tweet) {
        var message = util.format(
            '%s (%s): %s',
            tweet.username,
            tweet.screenname,
            tweet.text);
        bot.sendMessage(user.id, message);
      });
    });

  });

});

// Telegram command /stop
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
        var message = 'Обуна бекор қилинди. Қайта обуна бўлиш учун /start ни юборишингиз мумкин.';
        bot.sendMessage(user.id, message);
      } else {
        console.info('Cannot unsubscribe user', user.id);
      }
    });

  });

});


// Telegram command /info
bot.onText(/\/info/, function(msg, match) {

  var user = {
    id: msg.from.id,
  };

  var message = util.format(
      "Ушбу бот Twitter да ёзилаётган постларни бир жойда реал вақтда кўриш учун яратилди. Бот ҳозирда интернетда чоп этилаётган қуйидаги хештегларни доим кузатиб бормоқда.\n\n%s",
      hashtags);
  bot.sendMessage(user.id, message);

});


// Telegram command /stat
bot.onText(/\/stat/, function(msg, match) {

  var user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres (stat)');
      console.error(err);
      done();
      process.exit(-1);
    }

    getStat(client, user, function(stat) {
      done();
      var message = "📈 Статистика\n\n";
          message += util.format(
          "Жами постлар: %d та.\nОбуна бўлганлар: %d та.",
          stat.stat.total_posts,
          stat.stat.total_subscribers);
      bot.sendMessage(user.id, message);
    });

  });

});


// Telegram command /rating
bot.onText(/\/rating/, function(msg, match) {

  var user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres (rating)');
      console.error(err);
      done();
      process.exit(-1);
    }

    getRating(client, user, function(ratings) {
      done();

      var message = "📊 Рейтинг\n\n";
      message += "Энг фаол иштирокчилар:\n";
      ratings.forEach(function(rating) {
        rating.user_rating.forEach(function (user, i) {
          message += util.format(
              "%d. %s (%s): %d\n",
              i+1,
              user.username,
              user.screenname,
              user.posts);
        });
      });

      message += "\nЭнг фаол ҳудудлар:\n";
      ratings.forEach(function(rating) {
        rating.location_rating.forEach(function (location, i) {
          message += util.format(
              "%d. %s: %d\n",
              i+1,
              location.location,
              location.posts);
        });
      });

      bot.sendMessage(user.id, message);

    });

  });

});

// Telegram command /about
bot.onText(/\/about/, function(msg, match) {

  var user = {
    id: msg.from.id,
  };

  var message = "Муаллифлар: @crispybone, @Akhmatovich\nЛойиҳа коди: https://github.com/muminoff/uzb25bot";
  bot.sendMessage(user.id, message);

});


// Twitter stream
var stream = twit.stream('statuses/filter', { track: hashtags });
stream.on('connected', function(response) {
  console.info('Twitter client connected to stream');
});
stream.on('tweet', function(obj) {
  var tweet = {
    id: obj.id,
    text: obj.text,
    username: obj.user.name,
    screenname: obj.user.screen_name,
    location: obj.user.location,
    avatar: obj.user.profile_image_url,
    created_at: new Date(obj.created_at)
  };

  pg.connect(postgres_url, function(err, client, done) {
    if(err) {
      console.error('Cannot connect to Postgres (subscribe)');
      console.error(err);
      done();
      process.exit(-1);
    }

    saveTweet(client, tweet, function(ok) {
      done();
      if(ok) {
        console.info('Tweet', tweet.id, 'saved');
      } else {
        console.info('Cannot save tweet', tweet.id);
      }

    });

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
    broadcastTweet(tweetData);

  });
});


function broadcastTweet(tweet) {

  pg.connect(postgres_url, function(err, client, done) {

    if(err) {
      console.error('Cannot connect to Postgres (broadcast)');
      console.error(err);
      done();
      process.exit(-1);
    }

    console.info('Broadcasting tweet', tweet.id, 'to subscribers');
    getSubscribers(client, function(subscribers) {
      done();
      subscribers.forEach(function (subscriber) {
        console.log('Sending to subscriber ->', subscriber.id);
        var message = util.format(
            '%s (%s): %s',
            tweet.username,
            tweet.screenname,
            tweet.text);
        try {
          bot.sendMessage(subscriber['id'], message);
        } catch (err) {
          console.error(err);
        }
      });
    })

  });

}
