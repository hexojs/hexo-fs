'use strict';

const Promise = require('bluebird');
const fs = require('graceful-fs');
const { dirname, join, extname, basename } = require('path');
const fsPromises = fs.promises;
const chokidar = require('chokidar');
const escapeRegExp = require('escape-string-regexp');

const rEOL = /\r\n/g;

function exists(path, callback) {
  if (!path) throw new TypeError('path is required!');

  const promise = fsPromises.access(path).then(() => true, err => {
    if (err.code !== 'ENOENT') throw err;
    return false;
  }).then(exist => {
    if (typeof callback === 'function') callback(exist);
    return exist;
  });

  return Promise.resolve(promise);
}

function existsSync(path) {
  if (!path) throw new TypeError('path is required!');

  try {
    fs.accessSync(path);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    return false;
  }

  return true;
}

async function _mkdirs(path) {
  const parent = dirname(path);

  try {
    await fsPromises.access(path);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    await _mkdirs(parent);
  }

  try {
    await fsPromises.mkdir(path);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

function mkdirs(path, callback) {
  if (!path) throw new TypeError('path is required!');

  return Promise.resolve(_mkdirs(path)).asCallback(callback);
}

function mkdirsSync(path) {
  if (!path) throw new TypeError('path is required!');

  const parent = dirname(path);

  if (!fs.existsSync(parent)) mkdirsSync(parent);
  fs.mkdirSync(path);
}

function checkParent(path) {
  return Promise.resolve(_mkdirs(dirname(path)));
}

function checkParentSync(path) {
  if (!path) throw new TypeError('path is required!');

  const parent = dirname(path);

  if (fs.existsSync(parent)) return;

  try {
    mkdirsSync(parent);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

function writeFile(path, data, options, callback) {
  if (!path) throw new TypeError('path is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return checkParent(path).then(() => fsPromises.writeFile(path, data, options)).asCallback(callback);
}

function writeFileSync(path, data, options) {
  if (!path) throw new TypeError('path is required!');

  checkParentSync(path);
  fs.writeFileSync(path, data, options);
}

function appendFile(path, data, options, callback) {
  if (!path) throw new TypeError('path is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return checkParent(path).then(() => fsPromises.appendFile(path, data, options)).asCallback(callback);
}

function appendFileSync(path, data, options) {
  if (!path) throw new TypeError('path is required!');

  checkParentSync(path);
  fs.appendFileSync(path, data, options);
}

function copyFile(src, dest, flags, callback) {
  if (!src) throw new TypeError('src is required!');
  if (!dest) throw new TypeError('dest is required!');
  if (typeof flags === 'function') {
    callback = flags;
  }

  return checkParent(dest).then(() => fsPromises.copyFile(src, dest, flags)).asCallback(callback);
}

function trueFn() {
  return true;
}

function ignoreHiddenFiles(ignore) {
  if (!ignore) return trueFn;

  return item => item.name[0] !== '.';
}

function ignoreFilesRegex(regex) {
  if (!regex) return trueFn;

  return item => !regex.test(item.name);
}

function ignoreExcludeFiles(arr, parent) {
  if (!arr || !arr.length) return trueFn;

  const set = new Set(arr);

  return item => !set.has(join(parent, item.name));
}

function reduceFiles(result, item) {
  if (Array.isArray(item)) {
    return result.concat(item);
  }

  result.push(item);
  return result;
}

async function _readAndFilterDir(path, options) {
  const { ignoreHidden = true, ignorePattern } = options;
  return (await fsPromises.readdir(path, Object.assign(options, { withFileTypes: true })))
    .filter(ignoreHiddenFiles(ignoreHidden))
    .filter(ignoreFilesRegex(ignorePattern));
}

function _readAndFilterDirSync(path, options) {
  const { ignoreHidden = true, ignorePattern } = options;
  return fs.readdirSync(path, Object.assign(options, { withFileTypes: true }))
    .filter(ignoreHiddenFiles(ignoreHidden))
    .filter(ignoreFilesRegex(ignorePattern));
}

async function _copyDir(src, dest, options, parent) {
  const entrys = await _readAndFilterDir(src, options);
  return Promise.reduce(entrys.map(item => {
    const childSrc = join(src, item.name);
    const childDest = join(dest, item.name);
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      return _copyDir(childSrc, childDest, options, currentPath);
    }

    return copyFile(childSrc, childDest, options).thenReturn(currentPath);
  }), reduceFiles, []);
}

function copyDir(src, dest, options = {}, callback) {
  if (!src) throw new TypeError('src is required!');
  if (!dest) throw new TypeError('dest is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return checkParent(dest).then(() => _copyDir(src, dest, options, '')).asCallback(callback);
}

async function _listDir(path, options, parent) {
  const entrys = await _readAndFilterDir(path, options);
  return Promise.reduce(entrys.map(item => {
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      return _listDir(join(path, item.name), options, currentPath);
    }

    return currentPath;
  }), reduceFiles, []);
}

function listDir(path, options = {}, callback) {
  if (!path) throw new TypeError('path is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return Promise.resolve(_listDir(path, options, '')).asCallback(callback);
}

function _listDirSync(path, options, parent) {
  return _readAndFilterDirSync(path, options).map(item => {
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      return _listDirSync(join(path, item.name), options, currentPath);
    }

    return currentPath;
  }).reduce(reduceFiles, []);
}

function listDirSync(path, options = {}) {
  if (!path) throw new TypeError('path is required!');

  return _listDirSync(path, options, '');
}

function escapeEOL(str) {
  return str.replace(rEOL, '\n');
}

function escapeBOM(str) {
  return str.charCodeAt(0) === 0xFEFF ? str.substring(1) : str;
}

function escapeFileContent(content) {
  return escapeBOM(escapeEOL(content));
}

async function _readFile(path, options) {
  if (!Object.prototype.hasOwnProperty.call(options, 'encoding')) options.encoding = 'utf8';

  const content = await fsPromises.readFile(path, options);

  if (options.escape == null || options.escape) {
    return escapeFileContent(content);
  }

  return content;
}

function readFile(path, options = {}, callback) {
  if (!path) throw new TypeError('path is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return Promise.resolve(_readFile(path, options)).asCallback(callback);
}

function readFileSync(path, options = {}) {
  if (!path) throw new TypeError('path is required!');

  if (!Object.prototype.hasOwnProperty.call(options, 'encoding')) options.encoding = 'utf8';

  const content = fs.readFileSync(path, options);

  if (options.escape == null || options.escape) {
    return escapeFileContent(content);
  }

  return content;
}

async function _emptyDir(path, options, parent) {
  const entrys = (await _readAndFilterDir(path, options))
    .filter(ignoreExcludeFiles(options.exclude, parent));
  return Promise.reduce(entrys.map(item => {
    const fullPath = join(path, item.name);
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      return _emptyDir(fullPath, options, currentPath).then(files => {
        if (!files.length) return fsPromises.rmdir(fullPath).then(() => files);
        return files;
      });
    }

    return fsPromises.unlink(fullPath).then(() => currentPath);
  }), reduceFiles, []);
}

function emptyDir(path, options = {}, callback) {
  if (!path) throw new TypeError('path is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return Promise.resolve(_emptyDir(path, options, '')).asCallback(callback);
}

function _emptyDirSync(path, options, parent) {
  return _readAndFilterDirSync(path, options)
    .filter(ignoreExcludeFiles(options.exclude, parent))
    .map(item => {
      const childPath = join(path, item.name);
      const currentPath = join(parent, item.name);

      if (item.isDirectory()) {
        const removed = _emptyDirSync(childPath, options, currentPath);

        if (!fs.readdirSync(childPath).length) {
          rmdirSync(childPath);
        }

        return removed;
      }

      fs.unlinkSync(childPath);
      return currentPath;
    }).reduce(reduceFiles, []);
}

function emptyDirSync(path, options = {}) {
  if (!path) throw new TypeError('path is required!');

  return _emptyDirSync(path, options, '');
}

async function _rmdir(path) {
  const files = await fsPromises.readdir(path, { withFileTypes: true });
  await Promise.all(files.map(item => {
    const childPath = join(path, item.name);

    return item.isDirectory() ? _rmdir(childPath) : fsPromises.unlink(childPath);
  }));
  return fsPromises.rmdir(path);
}

function rmdir(path, callback) {
  if (!path) throw new TypeError('path is required!');

  return Promise.resolve(_rmdir(path)).asCallback(callback);
}

function _rmdirSync(path) {
  const files = fs.readdirSync(path, { withFileTypes: true });

  for (let i = 0, len = files.length; i < len; i++) {
    const item = files[i];
    const childPath = join(path, item.name);

    if (item.isDirectory()) {
      _rmdirSync(childPath);
    } else {
      fs.unlinkSync(childPath);
    }
  }

  fs.rmdirSync(path);
}

function rmdirSync(path) {
  if (!path) throw new TypeError('path is required!');

  _rmdirSync(path);
}

function watch(path, options, callback) {
  if (!path) throw new TypeError('path is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  const watcher = chokidar.watch(path, options);

  return new Promise((resolve, reject) => {
    watcher.on('ready', resolve);
    watcher.on('error', reject);
  }).thenReturn(watcher).asCallback(callback);
}

function _findUnusedPath(path, files) {
  const ext = extname(path);
  const base = basename(path, ext);
  const regex = new RegExp(`^${escapeRegExp(base)}(?:-(\\d+))?${escapeRegExp(ext)}$`);
  let num = -1;

  for (let i = 0, len = files.length; i < len; i++) {
    const item = files[i];
    const match = item.match(regex);

    if (match == null) continue;
    const matchNum = match[1] ? parseInt(match[1], 10) : 0;

    if (matchNum > num) {
      num = matchNum;
    }
  }

  return join(dirname(path), `${base}-${num + 1}${ext}`);
}

async function _ensurePath(path) {
  if (!await exists(path)) return path;

  const files = await fsPromises.readdir(dirname(path));
  return _findUnusedPath(path, files);
}

function ensurePath(path, callback) {
  if (!path) throw new TypeError('path is required!');

  return Promise.resolve(_ensurePath(path)).asCallback(callback);
}

function ensurePathSync(path) {
  if (!path) throw new TypeError('path is required!');
  if (!fs.existsSync(path)) return path;

  const files = fs.readdirSync(dirname(path));

  return _findUnusedPath(path, files);
}

function ensureWriteStream(path, options, callback) {
  if (!path) throw new TypeError('path is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return checkParent(path).then(() => fs.createWriteStream(path, options)).asCallback(callback);
}

function ensureWriteStreamSync(path, options) {
  if (!path) throw new TypeError('path is required!');

  checkParentSync(path);
  return fs.createWriteStream(path, options);
}

// access
['F_OK', 'R_OK', 'W_OK', 'X_OK'].forEach(key => {
  Object.defineProperty(exports, key, {
    enumerable: true,
    value: fs.constants[key],
    writable: false
  });
});

exports.access = Promise.promisify(fs.access);
exports.accessSync = fs.accessSync;

// appendFile
exports.appendFile = appendFile;
exports.appendFileSync = appendFileSync;

// chmod
exports.chmod = Promise.promisify(fs.chmod);
exports.chmodSync = fs.chmodSync;
exports.fchmod = Promise.promisify(fs.fchmod);
exports.fchmodSync = fs.fchmodSync;
exports.lchmod = Promise.promisify(fs.lchmod);
exports.lchmodSync = fs.lchmodSync;

// chown
exports.chown = Promise.promisify(fs.chown);
exports.chownSync = fs.chownSync;
exports.fchown = Promise.promisify(fs.fchown);
exports.fchownSync = fs.fchownSync;
exports.lchown = Promise.promisify(fs.lchown);
exports.lchownSync = fs.lchownSync;

// close
exports.close = Promise.promisify(fs.close);
exports.closeSync = fs.closeSync;

// copy
exports.copyDir = copyDir;
exports.copyFile = copyFile;

// createStream
exports.createReadStream = fs.createReadStream;
exports.createWriteStream = fs.createWriteStream;

// emptyDir
exports.emptyDir = emptyDir;
exports.emptyDirSync = emptyDirSync;

// ensurePath
exports.ensurePath = ensurePath;
exports.ensurePathSync = ensurePathSync;

// ensureWriteStream
exports.ensureWriteStream = ensureWriteStream;
exports.ensureWriteStreamSync = ensureWriteStreamSync;

// exists
exports.exists = exists;
exports.existsSync = existsSync;

// fsync
exports.fsync = Promise.promisify(fs.fsync);
exports.fsyncSync = fs.fsyncSync;

// link
exports.link = Promise.promisify(fs.link);
exports.linkSync = fs.linkSync;

// listDir
exports.listDir = listDir;
exports.listDirSync = listDirSync;

// mkdir
exports.mkdir = Promise.promisify(fs.mkdir);
exports.mkdirSync = fs.mkdirSync;

// mkdirs
exports.mkdirs = mkdirs;
exports.mkdirsSync = mkdirsSync;

// open
exports.open = Promise.promisify(fs.open);
exports.openSync = fs.openSync;

// symlink
exports.symlink = Promise.promisify(fs.symlink);
exports.symlinkSync = fs.symlinkSync;

// read
exports.read = Promise.promisify(fs.read);
exports.readSync = fs.readSync;

// readdir
exports.readdir = Promise.promisify(fs.readdir);
exports.readdirSync = fs.readdirSync;

// readFile
exports.readFile = readFile;
exports.readFileSync = readFileSync;

// readlink
exports.readlink = Promise.promisify(fs.readlink);
exports.readlinkSync = fs.readlinkSync;

// realpath
exports.realpath = Promise.promisify(fs.realpath);
exports.realpathSync = fs.realpathSync;

// rename
exports.rename = Promise.promisify(fs.rename);
exports.renameSync = fs.renameSync;

// rmdir
exports.rmdir = rmdir;
exports.rmdirSync = rmdirSync;

// stat
exports.stat = Promise.promisify(fs.stat);
exports.statSync = fs.statSync;
exports.fstat = Promise.promisify(fs.fstat);
exports.fstatSync = fs.fstatSync;
exports.lstat = Promise.promisify(fs.lstat);
exports.lstatSync = fs.lstatSync;

// truncate
exports.truncate = Promise.promisify(fs.truncate);
exports.truncateSync = fs.truncateSync;
exports.ftruncate = Promise.promisify(fs.ftruncate);
exports.ftruncateSync = fs.ftruncateSync;

// unlink
exports.unlink = Promise.promisify(fs.unlink);
exports.unlinkSync = fs.unlinkSync;

// utimes
exports.utimes = Promise.promisify(fs.utimes);
exports.utimesSync = fs.utimesSync;
exports.futimes = Promise.promisify(fs.futimes);
exports.futimesSync = fs.futimesSync;

// watch
exports.watch = watch;
exports.watchFile = fs.watchFile;
exports.unwatchFile = fs.unwatchFile;

// write
exports.write = Promise.promisify(fs.write);
exports.writeSync = fs.writeSync;

// writeFile
exports.writeFile = writeFile;
exports.writeFileSync = writeFileSync;

// Static classes
exports.Stats = fs.Stats;
exports.ReadStream = fs.ReadStream;
exports.WriteStream = fs.WriteStream;
exports.FileReadStream = fs.FileReadStream;
exports.FileWriteStream = fs.FileWriteStream;

// util
exports.escapeBOM = escapeBOM;
exports.escapeEOL = escapeEOL;
