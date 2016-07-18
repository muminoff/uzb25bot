var socket = require('socket.io-client')('http://uzb25bot.herokuapp.com');
socket.on('connect', function() {
  console.log('connected');
});

socket.on('tweet', function(data) {
  console.log(data);
});
