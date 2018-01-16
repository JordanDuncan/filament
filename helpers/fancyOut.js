'use strict';

function wrapText (text, code) {
  return '\x1b[' + code + text + '\x1b[0m';
}

module.exports = {
  bold: text => wrapText(text, '1m'),

  red: text => wrapText(text, '31m'),
  yellow: text => wrapText(text, '33m')
};
