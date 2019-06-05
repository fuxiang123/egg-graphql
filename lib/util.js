'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  walk(dir) {
    return this._walk(dir, dir);
  },
  _walk(basePath, dir) {
    let children = [];

    fs.readdirSync(dir).forEach(dirname => {
      const dpath = path.join(dir, dirname);
      const stat = fs.statSync(dpath);
      if (stat && stat.isDirectory()) {
        children.push(dpath.replace(basePath + path.sep, ''));
        children = children.concat(this._walk(basePath, dpath));
      }
    });
    return children;
  },
  //支持ts
  fileLoader(currentDir, fileName) {
    const fileJsPath = path.join(currentDir, type, fileName + ".js");
    const fileTsPath = path.join(currentDir, type, fileName + ".ts");
    if (fs.existsSync(fileJsPath)) {
      return require(fileJsPath);
    }
    if (fs.existsSync(fileTsPath)) {
      return require(fileTsPath);
    }
    return false;
  }
};
