'use strict';

const output = require('./output');
const similarity = require('./helpers/similarity');

const RESERVED_WORDS = ['_func'];

function checkIfSubfuncs (route) {
  for (let key in route) {
    if (RESERVED_WORDS.indexOf(key) === -1) {
      return true;
    }
  }
  return false;
}

function getSubfuncs (route) {
  let subfuncs = [];

  for (let key in route) {
    if (RESERVED_WORDS.indexOf(key) === -1) {
      subfuncs.push(key);
    }
  }

  return subfuncs;
}

function getSimilarCommand (input, commands) {
  for (let i = 0, l = commands.length; i < l; i++) {
    if (similarity(input, commands[i]) > 0.75) {
      return commands[i];
    }
  }

  return null;
}

function followArgs (args, allArgs, thisRoute, level, cb) {
  if (args.length === 0) {
    if ('_func' in thisRoute) {
      if (!thisRoute._func.arg || thisRoute._func.arg.required !== true) {
        return cb(null, thisRoute._func, null);
      } else {
        let cmd = allArgs.slice(0, level).join(' ') + ' {argument}';
        return cb(['🚫  Usage:', '   filament ' + cmd]);
      }
    } else {
      if (checkIfSubfuncs(thisRoute)) {
        let subfuncs = getSubfuncs(thisRoute);
        let cmd = allArgs.slice(0, level).join(' ') + ' <' + subfuncs.join('/') + '>';
        return cb(['🚫  Usage:', '   filament ' + cmd]);
      }
    }
  } else {
    if (checkIfSubfuncs(thisRoute)) {
      if (args[0] in thisRoute) {
        return followArgs(args.slice(1), allArgs, thisRoute[args[0]], level + 1, cb);
      } else {
        let subfuncs = getSubfuncs(thisRoute);
        let similar = getSimilarCommand(args[0], subfuncs);
        let response = ['🚫  Invalid Command'];

        if (similar) {
          let cmd = allArgs.slice(0, level).join(' ') + ' ' + similar;
          response.push('   Did you mean filament ' + cmd + '?');
        }

        return cb(response);
      }
    } else if (args.length === 1 && '_func' in thisRoute) {
      // check if an argument is expected
      if (thisRoute._func.arg) {
        return cb(null, thisRoute._func, args[0]);
      }
    }

    return cb('🚫  Invalid Command');
  }
}

function tryRoute (Filament, parsedIn, f) {
  followArgs(parsedIn._, parsedIn._, f, 0, (err, func, arg) => {
    if (err) {
      return output.error(err);
    }

    try {
      delete parsedIn._;
      func.run(Filament, parsedIn, arg);
    } catch (e) {
      if (e instanceof TypeError) {
        return output.error('👎  Filament Package Error', '   .run not defined');
      } else {
        throw e;
      }
    }
  });
}

module.exports = {
  tryRoute: tryRoute
};
