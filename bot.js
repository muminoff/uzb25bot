const util = require('util');
const pg = require('pg').native;
const twitter = require('twit');
const TelegramBot = require('node-telegram-bot-api');

// Environment variables
const postgres_url = process.env.DATABASE_URL;
const telegram_token = process.env.TELEGRAM_TOKEN;
const hashtags = process.env.HASHTAGS || 'uzb25, mustaqillik, dilizhori';

// Instances
let bot = new TelegramBot(
  telegram_token,
  {
    polling: true
  }
);

let twit = new twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const subscribe = require('./lib/user/subscribe');
const unsubscribe = require('./lib/user/unsubscribe');
const getLastTweets = require('./lib/tweets/getlasttweets');
const saveTweet = require('./lib/tweets/savetweet');
const getSubscribers = require('./lib/user/getsubscribers');
const getStat = require('./lib/stat/getstat');
const getRating = require('./lib/stat/getrating');

// Telegram command /start
bot.onText(/\/start/, (msg, match) => {
  const user = {
    id: msg.from.id,
    username: msg.from.username,
    first_name: msg.from.first_name,
    active: true,
    subscribed_at: new Date(msg.date * 1000)
  };

  pg.connect(postgres_url, (err, client, done) => {
    if (err) {
      console.error('Cannot connect to Postgres (subscribe)');
      console.error(err);
      done();
      process.exit(-1);
    }

    subscribe(client, user, ok => {
      done();
      if (ok) {
        console.info('User', user.id, 'subscribed');
        const message = 'Сиз обуна бўлдингиз. Обунани бекор қилиш учун исталган вақтда /stop буйруғини юборишингиз мумкин.';
        bot.sendMessage(user.id, message);
      } else {
        console.info('Cannot subscribe user', user.id);
      }
    });

    getLastTweets(client, user, lastTweets => {
      done();
      console.info('Sending last 10 tweets to user', user.id);
      lastTweets.forEach(tweet => {
        const message = util.format(
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
bot.onText(/\/stop/, (msg, match) => {
  const user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, (err, client, done) => {
    if (err) {
      console.error('Cannot connect to Postgres (unsubscribe)');
      console.error(err);
      done();
      process.exit(-1);
    }

    unsubscribe(client, user, ok => {
      done();
      if (ok) {
        console.info('User', user.id, 'unsubscribed');
        const message = 'Обуна бекор қилинди. Қайта обуна бўлиш учун /start ни юборишингиз мумкин.';
        bot.sendMessage(user.id, message);
      } else {
        console.info('Cannot unsubscribe user', user.id);
      }
    });

  });

});


// Telegram command /info
bot.onText(/\/info/, (msg, match) => {

  const user = {
    id: msg.from.id,
  };

  const message = util.format(
    "Ушбу бот Twitter да ёзилаётган постларни бир жойда реал вақтда кўриш учун яратилди. Бот ҳозирда интернетда чоп этилаётган қуйидаги хештегларни доим кузатиб бормоқда.\n\n%s",
    hashtags);
  bot.sendMessage(user.id, message);

});


// Telegram command /stat
bot.onText(/\/stat/, (msg, match) => {

  const user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, (err, client, done) => {
    if (err) {
      console.error('Cannot connect to Postgres (stat)');
      console.error(err);
      done();
      process.exit(-1);
    }

    getStat(client, user, stat => {
      done();
      let message = "📈 Статистика\n\n";
      message += util.format(
        "Ёзилган постлар (жами): %d та.\nОбуна бўлганлар (жами): %d та.\nОбунани бекор қилганлар (жами): %d та.\nБир кунда ёзилган постлар (ўртача): %d та.\nБир кунда обуна бўлганлар (ўртача): %d та.",
        stat.stat.total_posts,
        stat.stat.total_subscribers,
        stat.stat.total_unsubscribers,
        stat.stat.avg_posts_per_day,
        stat.stat.avg_subscribers_per_day);
      bot.sendMessage(user.id, message);
    });

  });

});


// Telegram command /rating
bot.onText(/\/rating/, (msg, match) => {

  const user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, (err, client, done) => {
    if (err) {
      console.error('Cannot connect to Postgres (rating)');
      console.error(err);
      done();
      process.exit(-1);
    }

    getRating(client, user, ratings => {
      done();

      let message = "📊 Рейтинг\n\n";
      message += "Энг фаол иштирокчилар:\n";
      ratings.forEach(rating => {
        rating.user_rating.forEach((user, i) => {
          message += util.format(
            "%d. %s (%s): %d\n",
            i + 1,
            user.username,
            user.screenname,
            user.posts);
        });
      });

      message += "\nЭнг фаол ҳудудлар:\n";
      ratings.forEach(rating => {
        rating.location_rating.forEach((location, i) => {
          message += util.format(
            "%d. %s: %d\n",
            i + 1,
            location.location,
            location.posts);
        });
      });

      bot.sendMessage(user.id, message);

    });

  });

});

// Telegram command /about
bot.onText(/\/about/, (msg, match) => {

  const user = {
    id: msg.from.id,
  };

  const message = "Муаллифлар: @crispybone, @Akhmatovich\nЛойиҳа коди: https://github.com/muminoff/uzb25bot";
  bot.sendMessage(user.id, message);

});


// Twitter stream
const stream = twit.stream('statuses/filter', {
  track: hashtags
});
stream.on('connected', response => {
  console.info('Twitter client connected to stream');
});
stream.on('tweet', obj => {
  const tweet = {
    id: obj.id,
    text: obj.text,
    username: obj.user.name,
    screenname: obj.user.screen_name,
    location: obj.user.location,
    avatar: obj.user.profile_image_url,
    created_at: new Date(obj.created_at)
  };

  pg.connect(postgres_url, (err, client, done) => {
    if (err) {
      console.error('Cannot connect to Postgres (subscribe)');
      console.error(err);
      done();
      process.exit(-1);
    }

    saveTweet(client, tweet, ok => {
      done();
      if (ok) {
        console.info('Tweet', tweet.id, 'saved');
      } else {
        console.info('Cannot save tweet', tweet.id);
      }

    });

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
    broadcastTweet(tweetData);

  });
});


function broadcastTweet(tweet) {

  pg.connect(postgres_url, (err, client, done) => {

    if (err) {
      console.error('Cannot connect to Postgres (broadcast)');
      console.error(err);
      done();
      process.exit(-1);
    }

    console.info('Broadcasting tweet', tweet.id, 'to subscribers');
    getSubscribers(client, subscribers => {
      done();
      subscribers.forEach(subscriber => {
        console.log('Sending to subscriber ->', subscriber.id);
        const message = util.format(
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
