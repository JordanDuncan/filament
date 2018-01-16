#!/usr/bin/env node
'use strict';

const fs = require('fs');
const minimist = require('minimist');
const path = require('path');

const output = require('./output');
const Filament = require('./Filament');
const read = require('./readFilamentFile');

function requireFilament (packageName) {
  try {
    return require(path.join(process.cwd(), 'node_modules', packageName));
  } catch (e) {
    console.error(e);
    return output.error(['⁉️  Filament package could not be found.', '   Could not import ' + packageName]);
  }
}

function main () {
  // check that the package.json is set
  const packageFile = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageFile)) {
    return output.error(["📝  Couldn't load package.json", '   Are you running filament from a node project root?']);
  }

  const appPackage = require(packageFile);

  // check that the filament package is set
  if (!appPackage.config || !appPackage.config.filament || !appPackage.config.filament.package) {
    return output.error(['📦  Filament package undefined.', '   Define a Filament package in package.json config.filament.package']);
  }

  const filamentPackage = requireFilament(appPackage.config.filament.package);

  const f = new Filament(process.cwd(), path.join(process.cwd(), 'node_modules', appPackage.config.filament.package));

  const parsedIn = minimist(process.argv.slice(2));

  read.tryRoute(f, parsedIn, filamentPackage.cli);
}

main();
