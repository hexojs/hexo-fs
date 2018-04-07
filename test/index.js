'use strict';

var should = require('chai').should();
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('../lib/fs');

function createDummyFolder(path) {
  return Promise.all([
    // Normal files in a hidden folder
    fs.writeFile(pathFn.join(path, '.hidden', 'a.txt'), 'a'),
    fs.writeFile(pathFn.join(path, '.hidden', 'b.js'), 'b'),
    // Normal folder in a hidden folder
    fs.writeFile(pathFn.join(path, '.hidden', 'c', 'd'), 'd'),
    // Top-class files
    fs.writeFile(pathFn.join(path, 'e.txt'), 'e'),
    fs.writeFile(pathFn.join(path, 'f.js'), 'f'),
    // A hidden file
    fs.writeFile(pathFn.join(path, '.g'), 'g'),
    // Files in a normal folder
    fs.writeFile(pathFn.join(path, 'folder', 'h.txt'), 'h'),
    fs.writeFile(pathFn.join(path, 'folder', 'i.js'), 'i'),
    // A hidden files in a normal folder
    fs.writeFile(pathFn.join(path, 'folder', '.j'), 'j')
  ]);
}

describe('fs', function() {
  var tmpDir = pathFn.join(__dirname, 'fs_tmp');

  before(function() {
    return fs.mkdirs(tmpDir);
  });

  after(function() {
    return fs.rmdir(tmpDir);
  });

  it('exists()', function() {
    return fs.exists(tmpDir).then(function(exist) {
      exist.should.be.true;
    });
  });

  it('exists() - callback', function(callback) {
    fs.exists(tmpDir, function(exist) {
      exist.should.be.true;
      callback();
    });
  });

  it('exists() - path is required', function() {
    try {
      fs.exists();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('mkdirs()', function() {
    var target = pathFn.join(tmpDir, 'a', 'b', 'c');

    return fs.mkdirs(target).then(function() {
      return fs.exists(target);
    }).then(function(exist) {
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('mkdirs() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'a', 'b', 'c');

    fs.mkdirs(target, function(err) {
      should.not.exist(err);

      fs.exists(target, function(exist) {
        exist.should.be.true;
        fs.rmdir(pathFn.join(tmpDir, 'a'), callback);
      });
    });
  });

  it('mkdirs() - path is required', function() {
    try {
      fs.mkdirs();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('mkdirsSync()', function() {
    var target = pathFn.join(tmpDir, 'a', 'b', 'c');

    fs.mkdirsSync(target);

    return fs.exists(target).then(function(exist) {
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('mkdirsSync() - path is required', function() {
    try {
      fs.mkdirsSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('writeFile()', function() {
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    return fs.writeFile(target, body).then(function() {
      return fs.readFile(target);
    }).then(function(content) {
      content.should.eql(body);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('writeFile() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    fs.writeFile(target, body, function(err) {
      should.not.exist(err);

      fs.readFile(target, function(_, content) {
        content.should.eql(body);
        fs.rmdir(pathFn.join(tmpDir, 'a'), callback);
      });
    });
  });

  it('writeFile() - path is required', function() {
    try {
      fs.writeFile();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('writeFileSync()', function() {
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    fs.writeFileSync(target, body);

    return fs.readFile(target).then(function(content) {
      content.should.eql(body);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('writeFileSync() - path is required', function() {
    try {
      fs.writeFileSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('appendFile()', function() {
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';
    var body2 = 'bar';

    return fs.writeFile(target, body).then(function() {
      return fs.appendFile(target, body2);
    }).then(function() {
      return fs.readFile(target);
    }).then(function(content) {
      content.should.eql(body + body2);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('appendFile() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';
    var body2 = 'bar';

    fs.writeFile(target, body, function() {
      fs.appendFile(target, body2, function(err) {
        should.not.exist(err);

        fs.readFile(target, function(_, content) {
          content.should.eql(body + body2);
          fs.rmdir(pathFn.join(tmpDir, 'a'), callback);
        });
      });
    });
  });

  it('appendFile() - path is required', function() {
    try {
      fs.appendFile();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('appendFileSync()', function() {
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';
    var body2 = 'bar';

    return fs.writeFile(target, body).then(function() {
      fs.appendFileSync(target, body2);
      return fs.readFile(target);
    }).then(function(content) {
      content.should.eql(body + body2);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('appendFileSync() - path is required', function() {
    try {
      fs.appendFileSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('copyFile()', function() {
    var src = pathFn.join(tmpDir, 'test.txt');
    var dest = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    return fs.writeFile(src, body).then(function() {
      return fs.copyFile(src, dest);
    }).then(function() {
      return fs.readFile(dest);
    }).then(function(content) {
      content.should.eql(body);

      return Promise.all([
        fs.unlink(src),
        fs.rmdir(pathFn.join(tmpDir, 'a'))
      ]);
    });
  });

  it('copyFile() - callback', function(callback) {
    var src = pathFn.join(tmpDir, 'test.txt');
    var dest = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    fs.writeFile(src, body, function(err) {
      if (err) return callback(err);

      fs.copyFile(src, dest, function(err) {
        if (err) return callback(err);

        fs.readFile(dest, function(err, content) {
          if (err) return callback(err);
          content.should.eql(body);

          Promise.all([
            fs.unlink(src),
            fs.rmdir(pathFn.join(tmpDir, 'a'))
          ]).asCallback(callback);
        });
      });
    });
  });

  it('copyFile() - src is required', function() {
    try {
      fs.copyFile();
    } catch (err) {
      err.should.have.property('message', 'src is required!');
    }
  });

  it('copyFile() - dest is required', function() {
    try {
      fs.copyFile('123');
    } catch (err) {
      err.should.have.property('message', 'dest is required!');
    }
  });

  it('copyDir()', function() {
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function() {
      return fs.copyDir(src, dest);
    }).then(function(files) {
      files.should.have.members([
        'e.txt',
        'f.js',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')
      ]);

      return Promise.all([
        fs.readFile(pathFn.join(dest, 'e.txt')),
        fs.readFile(pathFn.join(dest, 'f.js')),
        fs.readFile(pathFn.join(dest, 'folder', 'h.txt')),
        fs.readFile(pathFn.join(dest, 'folder', 'i.js'))
      ]);
    }).then(function(result) {
      result.should.eql(['e', 'f', 'h', 'i']);
    }).then(function() {
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('copyDir() - callback', function(callback) {
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    createDummyFolder(src).then(function() {
      fs.copyDir(src, dest, function(err, files) {
        should.not.exist(err);
        files.should.have.members([
          'e.txt',
          'f.js',
          pathFn.join('folder', 'h.txt'),
          pathFn.join('folder', 'i.js')
        ]);

        Promise.all([
          fs.readFile(pathFn.join(dest, 'e.txt')),
          fs.readFile(pathFn.join(dest, 'f.js')),
          fs.readFile(pathFn.join(dest, 'folder', 'h.txt')),
          fs.readFile(pathFn.join(dest, 'folder', 'i.js'))
        ]).then(function(result) {
          result.should.eql(['e', 'f', 'h', 'i']);
        }).then(function() {
          return Promise.all([
            fs.rmdir(src),
            fs.rmdir(dest)
          ]);
        }).asCallback(callback);
      });
    });
  });

  it('copyDir() - src is required', function() {
    try {
      fs.copyDir();
    } catch (err) {
      err.should.have.property('message', 'src is required!');
    }
  });

  it('copyDir() - dest is required', function() {
    try {
      fs.copyDir('123');
    } catch (err) {
      err.should.have.property('message', 'dest is required!');
    }
  });

  it('copyDir() - ignoreHidden off', function() {
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function() {
      return fs.copyDir(src, dest, {ignoreHidden: false});
    }).then(function(files) {
      files.should.have.members([
        pathFn.join('.hidden', 'a.txt'),
        pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'),
        'e.txt',
        'f.js',
        '.g',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'),
        pathFn.join('folder', '.j')
      ]);

      return Promise.all([
        fs.readFile(pathFn.join(dest, '.hidden', 'a.txt')),
        fs.readFile(pathFn.join(dest, '.hidden', 'b.js')),
        fs.readFile(pathFn.join(dest, '.hidden', 'c', 'd')),
        fs.readFile(pathFn.join(dest, 'e.txt')),
        fs.readFile(pathFn.join(dest, 'f.js')),
        fs.readFile(pathFn.join(dest, '.g')),
        fs.readFile(pathFn.join(dest, 'folder', 'h.txt')),
        fs.readFile(pathFn.join(dest, 'folder', 'i.js')),
        fs.readFile(pathFn.join(dest, 'folder', '.j'))
      ]);
    }).then(function(result) {
      result.should.eql(['a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    }).then(function() {
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('copyDir() - ignorePattern', function() {
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function() {
      return fs.copyDir(src, dest, {ignorePattern: /\.js/});
    }).then(function(files) {
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);

      return Promise.all([
        fs.readFile(pathFn.join(dest, 'e.txt')),
        fs.readFile(pathFn.join(dest, 'folder', 'h.txt'))
      ]);
    }).then(function(result) {
      result.should.eql(['e', 'h']);
    }).then(function() {
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('listDir()', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      return fs.listDir(target);
    }).then(function(files) {
      files.should.have.members([
        'e.txt',
        'f.js',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')
      ]);

      return fs.rmdir(target);
    });
  });

  it('listDir() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).then(function() {
      fs.listDir(target, function(err, files) {
        if (err) return callback(err);

        files.should.have.members([
          'e.txt',
          'f.js',
          pathFn.join('folder', 'h.txt'),
          pathFn.join('folder', 'i.js')
        ]);

        fs.rmdir(target, callback);
      });
    });
  });

  it('listDir() - path is required', function() {
    try {
      fs.listDir();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('listDir() - ignoreHidden off', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      return fs.listDir(target, {ignoreHidden: false});
    }).then(function(files) {
      files.should.have.members([
        pathFn.join('.hidden', 'a.txt'),
        pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'),
        'e.txt',
        'f.js',
        '.g',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'),
        pathFn.join('folder', '.j')
      ]);

      return fs.rmdir(target);
    });
  });

  it('listDir() - ignorePattern', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      return fs.listDir(target, {ignorePattern: /\.js/});
    }).then(function(files) {
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);
      return fs.rmdir(target);
    });
  });

  it('listDirSync()', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      var files = fs.listDirSync(target);
      files.should.have.members([
        'e.txt',
        'f.js',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')
      ]);

      return fs.rmdir(target);
    });
  });

  it('listDirSync() - path is required', function() {
    try {
      fs.listDirSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('listDirSync() - ignoreHidden off', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      var files = fs.listDirSync(target, {ignoreHidden: false});
      files.should.have.members([
        pathFn.join('.hidden', 'a.txt'),
        pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'),
        'e.txt',
        'f.js',
        '.g',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'),
        pathFn.join('folder', '.j')
      ]);

      return fs.rmdir(target);
    });
  });

  it('listDirSync() - ignorePattern', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      var files = fs.listDirSync(target, {ignorePattern: /\.js/});
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);
      return fs.rmdir(target);
    });
  });

  it('readFile()', function() {
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'test';

    return fs.writeFile(target, body).then(function() {
      return fs.readFile(target);
    }).then(function(content) {
      content.should.eql(body);
      return fs.unlink(target);
    });
  });

  it('readFile() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'test';

    fs.writeFile(target, body, function(err) {
      if (err) return callback(err);

      fs.readFile(target, function(err, content) {
        if (err) return callback(err);

        content.should.eql(body);
        fs.unlink(target, callback);
      });
    });
  });

  it('readFile() - path is required', function() {
    try {
      fs.readFile();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('readFile() - escape BOM', function() {
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = '\ufefffoo';

    return fs.writeFile(target, body).then(function() {
      return fs.readFile(target);
    }).then(function(content) {
      content.should.eql('foo');
      return fs.unlink(target);
    });
  });

  it('readFile() - escape Windows line ending', function() {
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'foo\r\nbar';

    return fs.writeFile(target, body).then(function() {
      return fs.readFile(target);
    }).then(function(content) {
      content.should.eql('foo\nbar');
      return fs.unlink(target);
    });
  });

  it('readFileSync()', function() {
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'test';

    return fs.writeFile(target, body).then(function() {
      fs.readFileSync(target).should.eql(body);
      return fs.unlink(target);
    });
  });

  it('readFileSync() - path is required', function() {
    try {
      fs.readFileSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('readFileSync() - escape BOM', function() {
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = '\ufefffoo';

    return fs.writeFile(target, body).then(function() {
      fs.readFileSync(target).should.eql('foo');
      return fs.unlink(target);
    });
  });

  it('readFileSync() - escape Windows line ending', function() {
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'foo\r\nbar';

    return fs.writeFile(target, body).then(function() {
      fs.readFileSync(target).should.eql('foo\nbar');
      return fs.unlink(target);
    });
  });

  it('unlink()', function() {
    var target = pathFn.join(tmpDir, 'test-unlink');

    return fs.writeFile(target, '').then(function() {
      return fs.exists(target);
    }).then(function(exist) {
      exist.should.eql(true);
      return fs.unlink(target);
    }).then(function() {
      return fs.exists(target);
    }).then(function(exist) {
      exist.should.eql(false);
    });
  });

  it('emptyDir()', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      return fs.emptyDir(target);
    }).then(function(files) {
      files.should.have.members([
        'e.txt',
        'f.js',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')
      ]);

      return [
        [pathFn.join(target, '.hidden', 'a.txt'), true],
        [pathFn.join(target, '.hidden', 'b.js'), true],
        [pathFn.join(target, '.hidden', 'c', 'd'), true],
        [pathFn.join(target, 'e.txt'), false],
        [pathFn.join(target, 'f.js'), false],
        [pathFn.join(target, '.g'), true],
        [pathFn.join(target, 'folder', 'h.txt'), false],
        [pathFn.join(target, 'folder', 'i.js'), false],
        [pathFn.join(target, 'folder', '.j'), true]
      ];
    }).map(function(data) {
      return fs.exists(data[0]).then(function(exist) {
        exist.should.eql(data[1]);
      });
    }).then(function() {
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).then(function() {
      fs.emptyDir(target, function(err, files) {
        if (err) return callback(err);

        files.should.have.members([
          'e.txt',
          'f.js',
          pathFn.join('folder', 'h.txt'),
          pathFn.join('folder', 'i.js')
        ]);

        Promise.map([
          [pathFn.join(target, '.hidden', 'a.txt'), true],
          [pathFn.join(target, '.hidden', 'b.js'), true],
          [pathFn.join(target, '.hidden', 'c', 'd'), true],
          [pathFn.join(target, 'e.txt'), false],
          [pathFn.join(target, 'f.js'), false],
          [pathFn.join(target, '.g'), true],
          [pathFn.join(target, 'folder', 'h.txt'), false],
          [pathFn.join(target, 'folder', 'i.js'), false],
          [pathFn.join(target, 'folder', '.j'), true]
        ], function(data) {
          return fs.exists(data[0]).then(function(exist) {
            exist.should.eql(data[1]);
          });
        }).then(function() {
          return fs.rmdir(target);
        }).asCallback(callback);
      });
    });
  });

  it('emptyDir() - path is required', function() {
    try {
      fs.emptyDir();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('emptyDir() - ignoreHidden off', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      return fs.emptyDir(target, {ignoreHidden: false});
    }).then(function(files) {
      files.should.have.members([
        pathFn.join('.hidden', 'a.txt'),
        pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'),
        'e.txt',
        'f.js',
        '.g',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'),
        pathFn.join('folder', '.j')
      ]);

      return [
        [pathFn.join(target, '.hidden', 'a.txt'), false],
        [pathFn.join(target, '.hidden', 'b.js'), false],
        [pathFn.join(target, '.hidden', 'c', 'd'), false],
        [pathFn.join(target, 'e.txt'), false],
        [pathFn.join(target, 'f.js'), false],
        [pathFn.join(target, '.g'), false],
        [pathFn.join(target, 'folder', 'h.txt'), false],
        [pathFn.join(target, 'folder', 'i.js'), false],
        [pathFn.join(target, 'folder', '.j'), false]
      ];
    }).map(function(data) {
      return fs.exists(data[0]).then(function(exist) {
        exist.should.eql(data[1]);
      });
    }).then(function() {
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - ignorePattern', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      return fs.emptyDir(target, {ignorePattern: /\.js/});
    }).then(function(files) {
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);

      return [
        [pathFn.join(target, '.hidden', 'a.txt'), true],
        [pathFn.join(target, '.hidden', 'b.js'), true],
        [pathFn.join(target, '.hidden', 'c', 'd'), true],
        [pathFn.join(target, 'e.txt'), false],
        [pathFn.join(target, 'f.js'), true],
        [pathFn.join(target, '.g'), true],
        [pathFn.join(target, 'folder', 'h.txt'), false],
        [pathFn.join(target, 'folder', 'i.js'), true],
        [pathFn.join(target, 'folder', '.j'), true]
      ];
    }).map(function(data) {
      return fs.exists(data[0]).then(function(exist) {
        exist.should.eql(data[1]);
      });
    }).then(function() {
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - exclude', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      return fs.emptyDir(target, {exclude: ['e.txt', pathFn.join('folder', 'i.js')]});
    }).then(function(files) {
      files.should.have.members(['f.js', pathFn.join('folder', 'h.txt')]);

      return [
        [pathFn.join(target, '.hidden', 'a.txt'), true],
        [pathFn.join(target, '.hidden', 'b.js'), true],
        [pathFn.join(target, '.hidden', 'c', 'd'), true],
        [pathFn.join(target, 'e.txt'), true],
        [pathFn.join(target, 'f.js'), false],
        [pathFn.join(target, '.g'), true],
        [pathFn.join(target, 'folder', 'h.txt'), false],
        [pathFn.join(target, 'folder', 'i.js'), true],
        [pathFn.join(target, 'folder', '.j'), true]
      ];
    }).map(function(data) {
      return fs.exists(data[0]).then(function(exist) {
        exist.should.eql(data[1]);
      });
    }).then(function() {
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync()', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      var files = fs.emptyDirSync(target);
      files.should.have.members([
        'e.txt',
        'f.js',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')
      ]);

      return [
        [pathFn.join(target, '.hidden', 'a.txt'), true],
        [pathFn.join(target, '.hidden', 'b.js'), true],
        [pathFn.join(target, '.hidden', 'c', 'd'), true],
        [pathFn.join(target, 'e.txt'), false],
        [pathFn.join(target, 'f.js'), false],
        [pathFn.join(target, '.g'), true],
        [pathFn.join(target, 'folder', 'h.txt'), false],
        [pathFn.join(target, 'folder', 'i.js'), false],
        [pathFn.join(target, 'folder', '.j'), true]
      ];
    }).map(function(data) {
      return fs.exists(data[0]).then(function(exist) {
        exist.should.eql(data[1]);
      });
    }).then(function() {
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - path is required', function() {
    try {
      fs.emptyDirSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('emptyDirSync() - ignoreHidden off', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      var files = fs.emptyDirSync(target, {ignoreHidden: false});
      files.should.have.members([
        pathFn.join('.hidden', 'a.txt'),
        pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'),
        'e.txt',
        'f.js',
        '.g',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'),
        pathFn.join('folder', '.j')
      ]);

      return [
        [pathFn.join(target, '.hidden', 'a.txt'), false],
        [pathFn.join(target, '.hidden', 'b.js'), false],
        [pathFn.join(target, '.hidden', 'c', 'd'), false],
        [pathFn.join(target, 'e.txt'), false],
        [pathFn.join(target, 'f.js'), false],
        [pathFn.join(target, '.g'), false],
        [pathFn.join(target, 'folder', 'h.txt'), false],
        [pathFn.join(target, 'folder', 'i.js'), false],
        [pathFn.join(target, 'folder', '.j'), false]
      ];
    }).map(function(data) {
      return fs.exists(data[0]).then(function(exist) {
        exist.should.eql(data[1]);
      });
    }).then(function() {
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - ignorePattern', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      var files = fs.emptyDirSync(target, {ignorePattern: /\.js/});
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);

      return [
        [pathFn.join(target, '.hidden', 'a.txt'), true],
        [pathFn.join(target, '.hidden', 'b.js'), true],
        [pathFn.join(target, '.hidden', 'c', 'd'), true],
        [pathFn.join(target, 'e.txt'), false],
        [pathFn.join(target, 'f.js'), true],
        [pathFn.join(target, '.g'), true],
        [pathFn.join(target, 'folder', 'h.txt'), false],
        [pathFn.join(target, 'folder', 'i.js'), true],
        [pathFn.join(target, 'folder', '.j'), true]
      ];
    }).map(function(data) {
      return fs.exists(data[0]).then(function(exist) {
        exist.should.eql(data[1]);
      });
    }).then(function() {
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - exclude', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      var files = fs.emptyDirSync(target, {exclude: ['e.txt', pathFn.join('folder', 'i.js')]});
      files.should.have.members(['f.js', pathFn.join('folder', 'h.txt')]);

      return [
        [pathFn.join(target, '.hidden', 'a.txt'), true],
        [pathFn.join(target, '.hidden', 'b.js'), true],
        [pathFn.join(target, '.hidden', 'c', 'd'), true],
        [pathFn.join(target, 'e.txt'), true],
        [pathFn.join(target, 'f.js'), false],
        [pathFn.join(target, '.g'), true],
        [pathFn.join(target, 'folder', 'h.txt'), false],
        [pathFn.join(target, 'folder', 'i.js'), true],
        [pathFn.join(target, 'folder', '.j'), true]
      ];
    }).map(function(data) {
      return fs.exists(data[0]).then(function(exist) {
        exist.should.eql(data[1]);
      });
    }).then(function() {
      return fs.rmdir(target);
    });
  });

  it('rmdir()', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      return fs.rmdir(target);
    }).then(function() {
      return fs.exists(target);
    }).then(function(exist) {
      exist.should.be.false;
    });
  });

  it('rmdir() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).then(function() {
      fs.rmdir(target, function(err) {
        should.not.exist(err);

        fs.exists(target, function(exist) {
          exist.should.be.false;
          callback();
        });
      });
    });
  });

  it('rmdir() - path is required', function() {
    try {
      fs.rmdir();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('rmdirSync()', function() {
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function() {
      fs.rmdirSync(target);
      return fs.exists(target);
    }).then(function(exist) {
      exist.should.be.false;
    });
  });

  it('rmdirSync() - path is required', function() {
    try {
      fs.rmdirSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('watch()', function() {
    var watcher;
    var target = pathFn.join(tmpDir, 'test.txt');

    return fs.watch(tmpDir).then(function(watcher_) {
      watcher = watcher_;

      return new Promise(function(resolve, reject) {
        watcher.on('add', function(path_) {
          try {
            path_.should.eql(target);
          } catch (err) {
            reject(err);
          }
          resolve();
        });

        fs.writeFile(target, 'test').catch(reject);
      });
    }).finally(function() {
      if (watcher) watcher.close();
    }).then(function() { return fs.unlink(target); });
  });

  it('watch() - path is required', function() {
    try {
      fs.watch();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('ensurePath() - file exists', function() {
    var target = pathFn.join(tmpDir, 'test');

    return Promise.all([
      fs.writeFile(pathFn.join(target, 'foo.txt')),
      fs.writeFile(pathFn.join(target, 'foo-1.txt')),
      fs.writeFile(pathFn.join(target, 'foo-2.md')),
      fs.writeFile(pathFn.join(target, 'bar.txt'))
    ]).then(function() {
      return fs.ensurePath(pathFn.join(target, 'foo.txt'));
    }).then(function(path) {
      path.should.eql(pathFn.join(target, 'foo-2.txt'));
      return fs.rmdir(target);
    });
  });

  it('ensurePath() - file not exist', function() {
    var target = pathFn.join(tmpDir, 'foo.txt');

    return fs.ensurePath(target).then(function(path) {
      path.should.eql(target);
    });
  });

  it('ensurePath() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'test');

    Promise.all([
      fs.writeFile(pathFn.join(target, 'foo.txt')),
      fs.writeFile(pathFn.join(target, 'foo-1.txt')),
      fs.writeFile(pathFn.join(target, 'foo-2.md')),
      fs.writeFile(pathFn.join(target, 'bar.txt'))
    ]).then(function() {
      fs.ensurePath(pathFn.join(target, 'foo.txt'), function(err, path) {
        should.not.exist(err);
        path.should.eql(pathFn.join(target, 'foo-2.txt'));
        fs.rmdir(target, callback);
      });
    });
  });

  it('ensurePath() - path is required', function() {
    try {
      fs.ensurePath();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('ensurePathSync() - file exists', function() {
    var target = pathFn.join(tmpDir, 'test');

    return Promise.all([
      fs.writeFile(pathFn.join(target, 'foo.txt')),
      fs.writeFile(pathFn.join(target, 'foo-1.txt')),
      fs.writeFile(pathFn.join(target, 'foo-2.md')),
      fs.writeFile(pathFn.join(target, 'bar.txt'))
    ]).then(function() {
      var path = fs.ensurePathSync(pathFn.join(target, 'foo.txt'));
      path.should.eql(pathFn.join(target, 'foo-2.txt'));

      return fs.rmdir(target);
    });
  });

  it('ensurePathSync() - file not exist', function() {
    var target = pathFn.join(tmpDir, 'foo.txt');
    var path = fs.ensurePathSync(target);

    path.should.eql(target);
  });

  it('ensurePathSync() - path is required', function() {
    try {
      fs.ensurePathSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('ensureWriteStream()', function(callback) {
    var target = pathFn.join(tmpDir, 'foo', 'bar.txt');

    fs.ensureWriteStream(target).then(function(stream) {
      stream.path.should.eql(target);
      stream.on('finish', function() {
        fs.unlink(target, callback);
      });
      stream.end();
    });
  });

  it('ensureWriteStream() - callback', function(callback) {
    var target = pathFn.join(tmpDir, 'foo', 'bar.txt');

    fs.ensureWriteStream(target, function(err, stream) {
      should.not.exist(err);
      stream.path.should.eql(target);
      stream.on('finish', function() {
        fs.unlink(target, callback);
      });
      stream.end();
    });
  });

  it('ensureWriteStreamSync()', function(callback) {
    var target = pathFn.join(tmpDir, 'foo', 'bar.txt');
    var stream = fs.ensureWriteStreamSync(target);

    stream.path.should.eql(target);
    stream.on('finish', function() {
      fs.rmdir(pathFn.dirname(target), callback);
    });
    stream.end();
  });
});
