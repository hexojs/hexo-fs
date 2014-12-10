var should = require('chai').should();
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('../lib/fs');

function createDummyFolder(path){
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

describe('fs', function(){
  var tmpDir = pathFn.join(__dirname, 'fs_tmp');

  before(function(){
    return fs.mkdirs(tmpDir);
  });

  it('exists()', function(){
    return fs.exists(tmpDir).then(function(exist){
      exist.should.be.true;
    });
  });

  it('exists() - callback', function(callback){
    fs.exists(tmpDir, function(exist){
      exist.should.be.true;
      callback();
    });
  });

  it('mkdirs()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'c');

    return fs.mkdirs(target).then(function(){
      return fs.exists(target);
    }).then(function(exist){
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('mkdirs() - callback', function(callback){
    var target = pathFn.join(tmpDir, 'a', 'b', 'c');

    fs.mkdirs(target, function(err){
      should.not.exist(err);

      fs.exists(target, function(exist){
        exist.should.be.true;
        fs.rmdir(pathFn.join(tmpDir, 'a'), callback);
      });
    });
  });

  it('mkdirsSync()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'c');

    fs.mkdirsSync(target);

    return fs.exists(target).then(function(exist){
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('writeFile()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    return fs.writeFile(target, body).then(function(){
      return fs.readFile(target);
    }).then(function(content){
      content.should.eql(body);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('writeFile() - callback', function(callback){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    fs.writeFile(target, body, function(err){
      should.not.exist(err);

      fs.readFile(target, function(err, content){
        content.should.eql(body);
        fs.rmdir(pathFn.join(tmpDir, 'a'), callback);
      });
    });
  });

  it('writeFileSync()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    fs.writeFileSync(target, body);

    return fs.readFile(target).then(function(content){
      content.should.eql(body);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('appendFile()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';
    var body2 = 'bar';

    return fs.writeFile(target, body).then(function(){
      return fs.appendFile(target, body2);
    }).then(function(){
      return fs.readFile(target);
    }).then(function(content){
      content.should.eql(body + body2);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('appendFile() - callback', function(callback){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';
    var body2 = 'bar';

    fs.writeFile(target, body, function(err){
      fs.appendFile(target, body2, function(err){
        should.not.exist(err);

        fs.readFile(target, function(err, content){
          content.should.eql(body + body2);
          fs.rmdir(pathFn.join(tmpDir, 'a'), callback);
        });
      });
    })
  });

  it('appendFileSync()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';
    var body2 = 'bar';

    return fs.writeFile(target, body).then(function(){
      fs.appendFileSync(target, body2);
      return fs.readFile(target);
    }).then(function(content){
      content.should.eql(body + body2);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('copyFile()', function(){
    var src = pathFn.join(tmpDir, 'test.txt');
    var dest = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    return fs.writeFile(src, body).then(function(){
      return fs.copyFile(src, dest);
    }).then(function(){
      return fs.readFile(dest);
    }).then(function(content){
      content.should.eql(body);

      return Promise.all([
        fs.unlink(src),
        fs.rmdir(pathFn.join(tmpDir, 'a'))
      ]);
    });
  });

  it('copyFile() - callback', function(callback){
    var src = pathFn.join(tmpDir, 'test.txt');
    var dest = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    fs.writeFile(src, body, function(err){
      fs.copyFile(src, dest, function(err){
        should.not.exist(err);

        fs.readFile(dest, function(err, content){
          content.should.eql(body);

          Promise.all([
            fs.unlink(src),
            fs.rmdir(pathFn.join(tmpDir, 'a'))
          ]).nodeify(callback);
        });
      });
    });
  });

  it('copyDir()', function(){
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function(){
      return fs.copyDir(src, dest);
    }).then(function(files){
      files.should.have.members(['e.txt', 'f.js', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')]);

      return Promise.all([
        fs.readFile(pathFn.join(dest, 'e.txt')),
        fs.readFile(pathFn.join(dest, 'f.js')),
        fs.readFile(pathFn.join(dest, 'folder', 'h.txt')),
        fs.readFile(pathFn.join(dest, 'folder', 'i.js'))
      ]);
    }).then(function(result){
      result.should.eql(['e', 'f', 'h', 'i']);
    }).then(function(){
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('copyDir() - callback', function(callback){
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    createDummyFolder(src).then(function(){
      fs.copyDir(src, dest, function(err, files){
        should.not.exist(err);
        files.should.have.members(['e.txt', 'f.js', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')]);

        Promise.all([
          fs.readFile(pathFn.join(dest, 'e.txt')),
          fs.readFile(pathFn.join(dest, 'f.js')),
          fs.readFile(pathFn.join(dest, 'folder', 'h.txt')),
          fs.readFile(pathFn.join(dest, 'folder', 'i.js'))
        ]).then(function(result){
          result.should.eql(['e', 'f', 'h', 'i']);
        }).then(function(){
          return Promise.all([
            fs.rmdir(src),
            fs.rmdir(dest)
          ]);
        }).nodeify(callback);
      });
    });
  });

  it('copyDir() - ignoreHidden off', function(){
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function(){
      return fs.copyDir(src, dest, {ignoreHidden: false});
    }).then(function(files){
      files.should.have.members([pathFn.join('.hidden', 'a.txt'), pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'), 'e.txt', 'f.js', '.g', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'), pathFn.join('folder', '.j')]);

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
    }).then(function(result){
      result.should.eql(['a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    }).then(function(){
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('copyDir() - ignorePattern', function(){
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function(){
      return fs.copyDir(src, dest, {ignorePattern: /\.js/});
    }).then(function(files){
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);

      return Promise.all([
        fs.readFile(pathFn.join(dest, 'e.txt')),
        fs.readFile(pathFn.join(dest, 'folder', 'h.txt'))
      ]);
    }).then(function(result){
      result.should.eql(['e', 'h']);
    }).then(function(){
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('listDir()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.listDir(target);
    }).then(function(files){
      files.should.have.members(['e.txt', 'f.js', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')]);
      return fs.rmdir(target);
    });
  });

  it('listDir() - callback', function(callback){
    var target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).then(function(){
      fs.listDir(target, function(err, files){
        should.not.exist(err);
        files.should.have.members(['e.txt', 'f.js', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')]);
        fs.rmdir(target, callback);
      });
    });
  });

  it('listDir() - ignoreHidden off', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.listDir(target, {ignoreHidden: false});
    }).then(function(files){
      files.should.have.members([pathFn.join('.hidden', 'a.txt'), pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'), 'e.txt', 'f.js', '.g', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'), pathFn.join('folder', '.j')]);

      return fs.rmdir(target);
    });
  });

  it('listDir() - ignorePattern', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.listDir(target, {ignorePattern: /\.js/});
    }).then(function(files){
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);
      return fs.rmdir(target);
    });
  });

  it('listDirSync()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.listDirSync(target);
      files.should.have.members(['e.txt', 'f.js', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')]);
      return fs.rmdir(target);
    });
  });

  it('listDirSync() - ignoreHidden off', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.listDirSync(target, {ignoreHidden: false});
      files.should.have.members([pathFn.join('.hidden', 'a.txt'), pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'), 'e.txt', 'f.js', '.g', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'), pathFn.join('folder', '.j')]);
      return fs.rmdir(target);
    });
  });

  it('listDirSync() - ignorePattern', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.listDirSync(target, {ignorePattern: /\.js/});
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);
      return fs.rmdir(target);
    });
  });

  it('readFile()', function(){
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'test';

    return fs.writeFile(target, body).then(function(){
      return fs.readFile(target);
    }).then(function(content){
      content.should.eql(body);
      return fs.unlink(target);
    });
  });

  it('readFile() - callback', function(callback){
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'test';

    fs.writeFile(target, body, function(err){
      fs.readFile(target, function(err, content){
        should.not.exist(err);
        content.should.eql(body);
        fs.unlink(target, callback);
      });
    });
  });

  it('readFileSync()', function(){
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'test';

    return fs.writeFile(target, body).then(function(){
      fs.readFileSync(target).should.eql(body);
      return fs.unlink(target);
    });
  });

  it('emptyDir()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.emptyDir(target);
    }).then(function(files){
      files.should.have.members(['e.txt', 'f.js', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')]);

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
    }).map(function(data){
      return fs.exists(data[0]).then(function(exist){
        exist.should.eql(data[1]);
      });
    }).then(function(){
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - callback', function(callback){
    var target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).then(function(){
      fs.emptyDir(target, function(err, files){
        should.not.exist(err);
        files.should.have.members(['e.txt', 'f.js', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')]);

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
        ], function(data){
          return fs.exists(data[0]).then(function(exist){
            exist.should.eql(data[1]);
          });
        }).then(function(){
          return fs.rmdir(target);
        }).nodeify(callback);
      });
    });
  });

  it('emptyDir() - ignoreHidden off', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.emptyDir(target, {ignoreHidden: false});
    }).then(function(files){
      files.should.have.members([pathFn.join('.hidden', 'a.txt'), pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'), 'e.txt', 'f.js', '.g', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'), pathFn.join('folder', '.j')]);

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
    }).map(function(data){
      return fs.exists(data[0]).then(function(exist){
        exist.should.eql(data[1]);
      });
    }).then(function(){
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - ignorePattern', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.emptyDir(target, {ignorePattern: /\.js/});
    }).then(function(files){
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
    }).map(function(data){
      return fs.exists(data[0]).then(function(exist){
        exist.should.eql(data[1]);
      });
    }).then(function(){
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - exclude', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.emptyDir(target, {exclude: ['e.txt', pathFn.join('folder', 'i.js')]});
    }).then(function(files){
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
    }).map(function(data){
      return fs.exists(data[0]).then(function(exist){
        exist.should.eql(data[1]);
      });
    }).then(function(){
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.emptyDirSync(target);
      files.should.have.members(['e.txt', 'f.js', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')]);

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
    }).map(function(data){
      return fs.exists(data[0]).then(function(exist){
        exist.should.eql(data[1]);
      });
    }).then(function(){
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - ignoreHidden off', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.emptyDirSync(target, {ignoreHidden: false});
      files.should.have.members([pathFn.join('.hidden', 'a.txt'), pathFn.join('.hidden', 'b.js'),
        pathFn.join('.hidden', 'c', 'd'), 'e.txt', 'f.js', '.g', pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js'), pathFn.join('folder', '.j')]);

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
    }).map(function(data){
      return fs.exists(data[0]).then(function(exist){
        exist.should.eql(data[1]);
      });
    }).then(function(){
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - ignorePattern', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
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
    }).map(function(data){
      return fs.exists(data[0]).then(function(exist){
        exist.should.eql(data[1]);
      });
    }).then(function(){
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - exclude', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
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
    }).map(function(data){
      return fs.exists(data[0]).then(function(exist){
        exist.should.eql(data[1]);
      });
    }).then(function(){
      return fs.rmdir(target);
    });
  });

  it('rmdir()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.rmdir(target);
    }).then(function(){
      return fs.exists(target);
    }).then(function(exist){
      exist.should.be.false;
    })
  });

  it('rmdir() - callback', function(callback){
    var target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).then(function(){
      fs.rmdir(target, function(err){
        should.not.exist(err);

        fs.exists(target, function(exist){
          exist.should.be.false;
          callback();
        });
      });
    });
  });

  it('rmdirSync()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      fs.rmdirSync(target);
      return fs.exists(target);
    }).then(function(exist){
      exist.should.be.false;
    });
  });

  it('watch()', function(callback){
    fs.watch(tmpDir, function(err, watcher){
      should.not.exist(err);

      var path = pathFn.join(tmpDir, 'test.txt');

      watcher.on('add', function(path_){
        path_.should.eql(path);
        watcher.close();
        fs.unlink(path, callback);
      });

      fs.writeFile(path, 'test');
    });
  });

  after(function(){
    return fs.rmdir(tmpDir);
  });
});