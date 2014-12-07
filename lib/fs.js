var Promise = require('bluebird');
var fs = require('graceful-fs');
var pathFn = require('path');

var dirname = pathFn.dirname;
var join = pathFn.join;
var EOL = require('os').EOL;
var rEOL = new RegExp(EOL, 'g');

var statAsync = Promise.promisify(fs.stat);
var readdirAsync = Promise.promisify(fs.readdir);
var unlinkAsync = Promise.promisify(fs.unlink);
var mkdirAsync = Promise.promisify(fs.mkdir);
var renameAsync = Promise.promisify(fs.rename);
var writeFileAsync = Promise.promisify(fs.writeFile);
var appendFileAsync = Promise.promisify(fs.appendFile);
var rmdirAsync = Promise.promisify(fs.rmdir);
var readFileAsync = Promise.promisify(fs.readFile);
var createReadStream = fs.createReadStream;
var createWriteStream = fs.createWriteStream;

function exists(path, callback){
  return new Promise(function(resolve, reject){
    fs.exists(path, function(exist){
      resolve(exist);
      if (typeof callback === 'function') callback(exist);
    });
  });
}

function mkdirs(path, callback){
  var parent = dirname(path);

  return exists(parent).then(function(exist){
    if (!exist) return mkdirs(parent);
  }).then(function(){
    return mkdirAsync(path);
  }).catch(function(err){
    if (err.cause.code !== 'EEXIST') throw err;
  }).nodeify(callback);
}

function mkdirsSync(path){
  var parent = dirname(path);
  var exist = fs.existsSync(parent);

  if (!exist) mkdirsSync(parent);
  fs.mkdirSync(path);
}

function checkParent(path){
  var parent = dirname(path);

  return exists(parent).then(function(exist){
    if (!exist) return mkdirs(parent);
  });
}

function checkParentSync(path){
  var parent = dirname(path);
  var exist = fs.existsSync(parent);

  if (exist) return;

  try {
    mkdirsSync(parent);
  } catch (err){
    if (err.code !== 'EEXIST') throw err;
  }
}

function writeFile(path, data, options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  return checkParent(path).then(function(){
    return writeFileAsync(path, data, options);
  }).nodeify(callback);
}

function writeFileSync(path, data, options){
  checkParentSync(path);
  fs.writeFileSync(path, data, options);
}

function appendFile(path, data, options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  return checkParent(path).then(function(){
    return appendFileAsync(path, data, options);
  }).nodeify(callback);
}

function appendFileSync(path, data, options){
  checkParentSync(path);
  fs.appendFileSync(path, data, options);
}

function copyFile(src, dest, callback){
  return checkParent(dest).then(function(){
    return new Promise(function(resolve, reject){
      var rs = createReadStream(src);
      var ws = createWriteStream(dest);

      rs.pipe(ws)
        .on('error', reject);

      ws.on('close', resolve)
        .on('error', reject);
    });
  }).nodeify(callback);
}

function trueFn(){
  return true;
}

function ignoreHiddenFiles(ignore){
  if (!ignore) return trueFn;

  return function(item){
    return item[0] !== '.';
  };
}

function ignoreFilesRegex(regex){
  if (!regex) return trueFn;

  return function(item){
    return !regex.test(item);
  };
}

function ignoreExcludeFiles(arr, parent){
  if (!arr || !arr.length) return trueFn;

  var len = arr.length;

  return function(item){
    var path = join(parent, item);

    for (var i = 0; i < len; i++){
      if (arr[i] === path) return false;
    }

    return true;
  };
}

function reduceFiles(result, item){
  if (Array.isArray(item)){
    return result.concat(item);
  } else {
    result.push(item);
    return result;
  }
}

function _copyDir(src, dest, options, parent){
  options = options || {};
  parent = parent || '';

  return checkParent(dest).then(function(){
    return readdirAsync(src);
  })
  .filter(ignoreHiddenFiles(options.ignoreHidden == null ? true : options.ignoreHidden))
  .filter(ignoreFilesRegex(options.ignorePattern))
  .map(function(item){
    var childSrc = join(src, item);
    var childDest = join(dest, item);

    return statAsync(childSrc).then(function(stats){
      if (stats.isDirectory()){
        return _copyDir(childSrc, childDest, options, join(parent, item));
      } else {
        return copyFile(childSrc, childDest, options)
          .thenReturn(join(parent, item));
      }
    });
  }).reduce(reduceFiles, []);
}

function copyDir(src, dest, options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  return _copyDir(src, dest, options).nodeify(callback);
}

function _listDir(path, options, parent){
  options = options || {};
  parent = parent || '';

  return readdirAsync(path)
  .filter(ignoreHiddenFiles(options.ignoreHidden == null ? true : options.ignoreHidden))
  .filter(ignoreFilesRegex(options.ignorePattern))
  .map(function(item){
    var childPath = join(path, item);

    return statAsync(childPath).then(function(stats){
      if (stats.isDirectory()){
        return _listDir(childPath, options, join(parent, item));
      } else {
        return join(parent, item);
      }
    });
  }).reduce(reduceFiles, []);
}

function listDir(path, options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  return _listDir(path, options).nodeify(callback);
}

function listDirSync(path, options, parent){
  options = options || {};
  parent = parent || '';

  return fs.readdirSync(path)
  .filter(ignoreHiddenFiles(options.ignoreHidden == null ? true : options.ignoreHidden))
  .filter(ignoreFilesRegex(options.ignorePattern))
  .map(function(item){
    var childPath = join(path, item);
    var stats = fs.statSync(childPath);

    if (stats.isDirectory()){
      return listDirSync(childPath, options, join(parent, item));
    } else {
      return join(parent, item);
    }
  }).reduce(reduceFiles, []);
}

function escapeEOL(str){
  return EOL === '\n' ? str : str.replace(rEOL, '\n');
}

function escapeBOM(str){
  return str.replace(/^\uFEFF/, '');
}

function escapeFileContent(content){
  return escapeBOM(escapeEOL(content));
}

function readFile(path, options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  options = options || {};
  if (options.encoding == null) options.encoding = 'utf8';

  return readFileAsync(path, options).then(function(content){
    if (options.escape == null || options.escape){
      return escapeFileContent(content);
    } else {
      return content;
    }
  }).nodeify(callback);
}

function readFileSync(path, options){
  options = options || {};
  if (options.encoding == null) options.encoding = 'utf8';

  var content = fs.readFileSync(path, options);

  if (options.escape == null || options.escape){
    return escapeFileContent(content);
  } else {
    return content;
  }
}

function _emptyDir(path, options, parent){
  options = options || {};
  parent = parent || '';

  return readdirAsync(path)
  .filter(ignoreHiddenFiles(options.ignoreHidden == null ? true : options.ignoreHidden))
  .filter(ignoreFilesRegex(options.ignorePattern))
  .filter(ignoreExcludeFiles(options.exclude, parent))
  .map(function(item){
    var childPath = join(path, item);

    return statAsync(childPath).then(function(stats){
      return {
        isDirectory: stats.isDirectory(),
        path: join(parent, item),
        fullPath: childPath
      };
    });
  }).map(function(item){
    var fullPath = item.fullPath;

    if (item.isDirectory){
      return _emptyDir(fullPath, options, item.path).then(function(removed){
        return readdirAsync(fullPath).then(function(files){
          if (!files.length) return rmdirAsync(fullPath);
        }).thenReturn(removed);
      });
    } else {
      return unlinkAsync(fullPath).thenReturn(item.path);
    }
  }).reduce(reduceFiles, []);
}

function emptyDir(path, options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  return _emptyDir(path, options).nodeify(callback);
}

function emptyDirSync(path, options, parent){
  options = options || {};
  parent = parent || '';

  return fs.readdirSync(path)
  .filter(ignoreHiddenFiles(options.ignoreHidden == null ? true : options.ignoreHidden))
  .filter(ignoreFilesRegex(options.ignorePattern))
  .filter(ignoreExcludeFiles(options.exclude, parent))
  .map(function(item){
    var childPath = join(path, item);
    var stats = fs.statSync(childPath);

    if (stats.isDirectory()){
      var removed = emptyDirSync(childPath, options, join(parent, item));

      if (!fs.readdirSync(childPath).length){
        rmdirSync(childPath);
      }

      return removed;
    } else {
      fs.unlinkSync(childPath);
      return join(parent, item);
    }
  }).reduce(reduceFiles, []);
}

function rmdir(path, callback){
  return readdirAsync(path).map(function(item){
    var childPath = join(path, item);

    return statAsync(childPath).then(function(stats){
      if (stats.isDirectory()){
        return rmdir(childPath);
      } else {
        return unlinkAsync(childPath);
      }
    });
  }).then(function(){
    return rmdirAsync(path);
  }).nodeify(callback);
}

function rmdirSync(path){
  var files = fs.readdirSync(path);
  var childPath;
  var stats;

  for (var i = 0, len = files.length; i < len; i++){
    childPath = join(path, files[i]);
    stats = fs.statSync(childPath);

    if (stats.isDirectory()){
      rmdirSync(childPath);
    } else {
      fs.unlinkSync(childPath);
    }
  }

  fs.rmdirSync(path);
}

exports.appendFile = appendFile;
exports.appendFileSync = appendFileSync;

exports.chmod = Promise.promisify(fs.chmod);
exports.chmodSync = fs.chmodSync;

exports.chown = Promise.promisify(fs.chown);
exports.chownSync = fs.chownSync;

exports.copyDir = copyDir;
exports.copyFile = copyFile;

exports.createReadStream = createReadStream;
exports.createWriteStream = createWriteStream;

exports.emptyDir = emptyDir;
exports.emptyDirSync = emptyDirSync;

exports.exists = exists;
exports.existsSync = fs.existsSync;

exports.listDir = listDir;
exports.listDirSync = listDirSync;

exports.mkdir = mkdirAsync;
exports.mkdirSync = fs.mkdirSync;

exports.mkdirs = mkdirs;
exports.mkdirsSync = mkdirsSync;

exports.readdir = readdirAsync;
exports.readdirSync = fs.readdirSync;

exports.readFile = readFile;
exports.readFileSync = readFileSync;

exports.rename = renameAsync;
exports.renameSync = fs.renameSync;

exports.rmdir = rmdir;
exports.rmdirSync = rmdirSync;

exports.stat = statAsync;
exports.statSync = fs.statSync;

exports.unlink = unlinkAsync;
exports.unlinkSync = fs.unlinkSync;

exports.writeFile = writeFile;
exports.writeFileSync = writeFileSync;