// Main modules
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

// API
const logger = require('./logger');
const subscribe = require('./lib/user/subscribe');
const unsubscribe = require('./lib/user/unsubscribe');
const getLastTweets = require('./lib/tweets/getlasttweets');
const saveTweet = require('./lib/tweets/savetweet');
const getSubscribers = require('./lib/user/getsubscribers');
const getStat = require('./lib/stat/getstat');
const getRating = require('./lib/stat/getrating');
const saveEvent = require('./lib/metrics/saveevent');

// Telegram command /start
bot.onText(/\/start/, (msg) => {
  const user = {
    id: msg.from.id,
    username: msg.from.username,
    first_name: msg.from.first_name,
    active: true,
    subscribed_at: new Date(msg.date * 1000)
  };

  pg.connect(postgres_url, (err, client, done) => {

    if (err) {
      /*eslint no-logger: ["error", { allow: ["warn", "error"] }] */
      logger.error('Cannot connect to Postgres (subscribe)');
      logger.error(err);
      done();
      process.exit(-1);
    }

    subscribe(client, logger, user, ok => {
      done();
      if (ok) {
        logger.info('User', user.id, 'subscribed');
        const message = 'Сиз обуна бўлдингиз. Обунани бекор қилиш учун исталган вақтда /stop буйруғини юборишингиз мумкин.';
        bot.sendMessage(user.id, message);
      } else {
        logger.info('Cannot subscribe user', user.id);
      }
    });

    getLastTweets(client, logger, user, lastTweets => {
      done();
      logger.info('Sending last 10 tweets to user', user.id);
      lastTweets.forEach(tweet => {
        const message = util.format(
            '%s (%s): %s',
            tweet.username,
            tweet.screenname,
            tweet.text);
        bot.sendMessage(user.id, message);
      });
    });

    const metrics = { user_id: user.id.toString(), command: '/start' };
    saveEvent(client, logger, metrics, ok => {
      done();
      if (ok==true) {
        logger.info('User', user.id, 'tracked.');
      } else {
        logger.error('Cannot track user', user.id);
      }
    });


  });

});

// Telegram command /stop
bot.onText(/\/stop/, (msg) => {
  const user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, (err, client, done) => {
    if (err) {
      logger.error('Cannot connect to Postgres (unsubscribe)');
      logger.error(err);
      done();
      process.exit(-1);
    }

    unsubscribe(client, logger, user, ok => {
      done();
      if (ok) {
        logger.info('User', user.id, 'unsubscribed');
        const message = 'Обуна бекор қилинди. Қайта обуна бўлиш учун /start ни юборишингиз мумкин.';
        bot.sendMessage(user.id, message);
      } else {
        logger.info('Cannot unsubscribe user', user.id);
      }
    });

  });

});


// Telegram command /info
bot.onText(/\/info/, (msg) => {

  const user = {
    id: msg.from.id,
  };

  const message = util.format(
      'Ушбу бот Twitter да ёзилаётган постларни бир жойда реал вақтда кўриш учун яратилди. Бот ҳозирда интернетда чоп этилаётган қуйидаги хештегларни доим кузатиб бормоқда.\n\n%s',
      hashtags);
  bot.sendMessage(user.id, message);

});


// Telegram command /stat
bot.onText(/\/stat/, (msg) => {

  const user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, (err, client, done) => {
    if (err) {
      logger.error('Cannot connect to Postgres (stat)');
      logger.error(err);
      done();
      process.exit(-1);
    }

    getStat(client, logger, user, stat => {
      done();
      let message = '📈 Статистика\n\n';
      message += util.format(
          'Ёзилган постлар (жами): %d та.\nОбуна бўлганлар (жами): %d та.\nОбунани бекор қилганлар (жами): %d та.\nБир кунда ёзилган постлар (ўртача): %d та.\nБир кунда обуна бўлганлар (ўртача): %d та.',
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
bot.onText(/\/rating/, (msg) => {

  const user = {
    id: msg.from.id,
  };

  pg.connect(postgres_url, (err, client, done) => {
    if (err) {
      logger.error('Cannot connect to Postgres (rating)');
      logger.error(err);
      done();
      process.exit(-1);
    }

    getRating(client, logger, user, ratings => {
      done();

      let message = '📊 Рейтинг\n\n';
      message += 'Энг фаол иштирокчилар:\n';
      ratings.forEach(rating => {
        rating.user_rating.forEach((user, i) => {
          message += util.format(
              '%d. %s (%s): %d\n',
              i + 1,
              user.username,
              user.screenname,
              user.posts);
        });
      });

      message += '\nЭнг фаол ҳудудлар:\n';
      ratings.forEach(rating => {
        rating.location_rating.forEach((location, i) => {
          message += util.format(
              '%d. %s: %d\n',
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
bot.onText(/\/about/, (msg) => {

  const user = {
    id: msg.from.id,
  };

  const message = 'Муаллифлар: @crispybone, @Akhmatovich\nЛойиҳа коди: https://github.com/muminoff/uzb25bot';
  bot.sendMessage(user.id, message);

});


// Twitter stream
const stream = twit.stream('statuses/filter', {
  track: hashtags
});
stream.on('connected', () => {
  logger.info('Twitter client connected to stream');
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
      logger.error('Cannot connect to Postgres (subscribe)');
      logger.error(err);
      done();
      process.exit(-1);
    }

    saveTweet(client, logger, tweet, ok => {
      done();
      if (ok) {
        logger.info('Tweet', tweet.id, 'saved');
      } else {
        logger.info('Cannot save tweet', tweet.id);
      }

    });

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

  pgClient.query('LISTEN channel', (err) => {

    if (err) {
      logger.error('Cannot listen to channel');
      process.exit(-1);
    }

    logger.info('Postgres channel listener started');

  });

  pgClient.on('notification', data => {

    const tweetData = JSON.parse(data.payload);
    logger.warn('Got tweet', tweetData.id, 'now broadcasting');
    broadcastTweet(tweetData);

  });
});


function broadcastTweet(tweet) {

  pg.connect(postgres_url, (err, client, done) => {

    if (err) {
      logger.error('Cannot connect to Postgres (broadcast)');
      logger.error(err);
      done();
      process.exit(-1);
    }

    logger.info('Broadcasting tweet', tweet.id, 'to subscribers');
    getSubscribers(client, logger, subscribers => {
      done();
      subscribers.forEach(subscriber => {
        logger.warn('Sending to subscriber ->', subscriber.id);
        const message = util.format(
            '%s (%s): %s',
            tweet.username,
            tweet.screenname,
            tweet.text);
        try {
          bot.sendMessage(subscriber['id'], message);
        } catch (err) {
          logger.error(err);
        }
      });
    });

  });

}
