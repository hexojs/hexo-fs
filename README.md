# fs

[![Build Status](https://travis-ci.org/hexojs/fs.svg?branch=master)](https://travis-ci.org/hexojs/fs)  [![NPM version](https://badge.fury.io/js/hexo-fs.svg)](http://badge.fury.io/js/hexo-fs) [![Coverage Status](https://img.shields.io/coveralls/hexojs/fs.svg)](https://coveralls.io/r/hexojs/fs?branch=master) [![Build status](https://ci.appveyor.com/api/projects/status/wift3c57kei3ylq4/branch/master?svg=true)](https://ci.appveyor.com/project/tommy351/fs/branch/master)

File system module for [Hexo].

## Features

- Support for both Promise and callback interface.
- Use [graceful-fs] to avoid EMFILE error and various improvements.
- Use [chokidar] for consistent file watching.

## Installation

``` bash
$ npm install hexo-fs
```

## Usage

``` js
var fs = require('hexo-fs');
```

## License

MIT

[graceful-fs]: https://github.com/isaacs/node-graceful-fs
[Hexo]: http://hexo.io/
[chokidar]: https://github.com/paulmillr/chokidar