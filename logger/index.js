const winston = require('winston');

const logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: 'all'
    })
  ]
});
