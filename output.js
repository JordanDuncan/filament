'use strict';

const fancyOut = require('./helpers/fancyOut');

function error (messages, code) {
  if (typeof messages === 'string') {
    messages = [messages];
  }

  if (!code) {
    code = 1;
  }

  for (let i = 0, l = messages.length; i < l; i++) {
    console.error(fancyOut.red(messages[i]));
  }

  process.exit(code);
}

function log (messages, code) {
  if (typeof messages === 'string') {
    messages = [messages];
  }

  for (let i = 0, l = messages.length; i < l; i++) {
    console.error(messages[i]);
  }
}

module.exports = {
  error: error,
  log: log
};
