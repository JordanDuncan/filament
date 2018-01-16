'use strict';

const mustache = require('mustache');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const output = require('./output');
const fancyOut = require('./helpers/fancyOut');

class Filament {
  constructor (appRoot, moduleRoot) {
    this.appRoot = appRoot;
    this.moduleRoot = moduleRoot;
  }

  _createFileFromTemplate (dest, template, data) {
    console.log('📝  Rendering file ' + fancyOut.bold(dest));

    let destPath = path.resolve(this.appRoot, dest);
    let templatePath = path.resolve(this.moduleRoot, 'source', template);

    if (fs.pathExistsSync(destPath)) {
      return console.log(fancyOut.red('   - Already exists'));
    }

    if (!fs.pathExistsSync(templatePath)) {
      return output.error(['👎  Filament Package Error', '   template ' + fancyOut.bold(template) + fancyOut.red(" doesn't exist.")]);
    }

    // read template file
    try {
      var templateContent = fs.readFileSync(templatePath, 'utf8');
    } catch (e) {
      return output.error("💔  Couldn't read template file");
    }

    // render
    var rendered = mustache.render(templateContent, data);

    fs.writeFileSync(destPath, rendered);
  }

  _createFileNotFromTemplate (dest, source) {
    console.log('📄  Writing file ' + fancyOut.bold(dest));

    let destPath = path.resolve(this.appRoot, dest);
    let sourcePath = path.resolve(this.moduleRoot, 'source', source);

    if (fs.pathExistsSync(destPath)) {
      return console.log(fancyOut.red('   - Already exists'));
    }

    if (!fs.pathExistsSync(sourcePath)) {
      return output.error(['👎  Filament Package Error', '   file ' + fancyOut.bold(source) + fancyOut.red(" doesn't exist.")]);
    }

    fs.copySync(sourcePath, destPath, { overwrite: false });
  }

  createDir (name) {
    console.log('📂  Creating directory ' + fancyOut.bold(name));
    if (fs.pathExistsSync(path.resolve(this.appRoot, name))) {
      return console.log(fancyOut.red('   - Already exists'));
    }
    fs.ensureDirSync(path.resolve(this.appRoot, name));
  }

  createFile (dest, source, data) {
    if (data) {
      this._createFileFromTemplate(dest, source, data);
    } else {
      this._createFileNotFromTemplate(dest, source);
    }
  }

  checkIfExists (dest) {
    return fs.pathExistsSync(path.resolve(this.appRoot, dest));
  }

  regexWrite (dest, find, replace) {
    let destPath = path.resolve(this.appRoot, dest);
    let fileContent = null;
    let newFileContent = null;

    try {
      fileContent = fs.readFileSync(destPath, 'utf8');
    } catch (e) {
      return output.error("💔  Couldn't read " + dest);
    }

    try {
      newFileContent = fileContent.replace(find, replace);
    } catch (e) {
      return output.error("💔  Couldn't perform replace operation");
    }

    fs.writeFileSync(destPath, newFileContent, 'utf8');
  }

  askList (title, answers, callback) {
    inquirer.prompt([
      {
        type: 'list',
        message: title,
        name: 'flmt-select',
        choices: answers
      }
    ]).then((answers) => {
      return callback(answers['flmt-select']);
    });
  }

  log (message) {
    return output.log('ℹ️  ' + message);
  }

  exit (message) {
    return output.error('👎  ' + message);
  }
}

module.exports = Filament;
