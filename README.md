# fs

[![Build Status](https://travis-ci.org/hexojs/fs.svg?branch=master)](https://travis-ci.org/hexojs/fs)  [![NPM version](https://badge.fury.io/js/hexo-fs.svg)](http://badge.fury.io/js/hexo) [![Coverage Status](https://img.shields.io/coveralls/hexojs/fs.svg)](https://coveralls.io/r/hexojs/fs?branch=master) [![Build status](https://ci.appveyor.com/api/projects/status/wift3c57kei3ylq4/branch/master?svg=true)](https://ci.appveyor.com/project/tommy351/fs/branch/master)

File system module for [Hexo].

## Features

- Support for both Promise and callback interface.
- Use [graceful-fs] to avoid EMFILE error and various improvements.

## Installation

``` bash
$ npm install hexo-fs
```

## Usage

``` js
var fs = require('hexo-fs');
```

## API

### appendFile(path, data, [options], [callback])

### appendFileSync(path, data, [options])

### chmod(path, mode, [callback])

### chmodSync(path, mode)

### chown(path, uid, gid, [callback])

### chownSync(path, uid, gid)

### copyDir(src, dest, options, [callback])

### copyFile(src, dest, [callback])

### createReadStream(path, [options])

### createWriteStream(path, [options])

### emptyDir(path, [options], [callback])

### emptyDirSync(path, [options])

### exists(path, [callback])

### existsSync(path)

### listDir(path, [options], [callback])

### listDirSync(path, [options])

### mkdir(path, [mode], [callback])

### mkdirSync(path, [mode])

### mkdirs(path, [callback])

### mkdirsSync(path)

### readdir(path, [callback])

### readdirSync(path)

### readFile(path, [options], [callback])

### readFileSync(path, [options])

### rmdir(path, [callback])

### rmdirSync(path)

### stat(path, [callback])

### statSync(path)

### unlink(path, [callback])

### unlinkSync(path)

### writeFile(path, data, [options], [callback])

### writeFileSync(path, data, [options])

## Utilities

### escapeBOM(str)

### escapeEOL(str)

## License

MIT

[graceful-fs]: https://github.com/isaacs/node-graceful-fs
[Hexo]: http://hexo.io/