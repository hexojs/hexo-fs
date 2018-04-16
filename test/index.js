'use strict';

require('chai').should();
const pathFn = require('path');
const Promise = require('bluebird');
const fs = require('../lib/fs');

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

describe('fs', () => {
  const tmpDir = pathFn.join(__dirname, 'fs_tmp');

  before(() => fs.mkdirs(tmpDir));

  after(() => fs.rmdir(tmpDir));

  it('exists()', () => fs.exists(tmpDir).then(exist => {
    exist.should.be.true;
  }));

  it('exists() - callback', callback => {
    fs.exists(tmpDir, exist => {
      exist.should.be.true;
      callback();
    });
  });

  it('exists() - path is required', () => {
    try {
      fs.exists();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('mkdirs()', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'c');

    return fs.mkdirs(target).then(() => fs.exists(target)).then(exist => {
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('mkdirs() - callback', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'c');

    const testerPromise = new Promise((resolve, reject) => {
      fs.mkdirs(target, err => { err ? reject(err) : resolve(); });
    });

    return testerPromise
      .then(() => fs.exists(target))
      .then(exist => {
        exist.should.be.true;
        return fs.rmdir(pathFn.join(tmpDir, 'a'));
      });
  });

  it('mkdirs() - path is required', () => {
    try {
      fs.mkdirs();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('mkdirsSync()', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'c');

    fs.mkdirsSync(target);

    return fs.exists(target).then(exist => {
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('mkdirsSync() - path is required', () => {
    try {
      fs.mkdirsSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('writeFile()', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    return fs.writeFile(target, body)
      .then(() => fs.readFile(target))
      .then(content => {
        content.should.eql(body);
        return fs.rmdir(pathFn.join(tmpDir, 'a'));
      });
  });

  it('writeFile() - callback', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    const testerPromise = new Promise((resolve, reject) => {
      fs.writeFile(target, body, err => { err ? reject(err) : resolve(); });
    });

    return testerPromise
      .then(() => fs.readFile(target))
      .then(content => {
        content.should.eql(body);
        return fs.rmdir(pathFn.join(tmpDir, 'a'));
      });
  });

  it('writeFile() - path is required', () => {
    try {
      fs.writeFile();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('writeFileSync()', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    fs.writeFileSync(target, body);

    return fs.readFile(target).then(content => {
      content.should.eql(body);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('writeFileSync() - path is required', () => {
    try {
      fs.writeFileSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('appendFile()', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';
    const body2 = 'bar';

    return fs.writeFile(target, body)
      .then(() => fs.appendFile(target, body2))
      .then(() => fs.readFile(target))
      .then(content => {
        content.should.eql(body + body2);
        return fs.rmdir(pathFn.join(tmpDir, 'a'));
      });
  });

  it('appendFile() - callback', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';
    const body2 = 'bar';

    const testerWrap = () => new Promise((resolve, reject) => {
      fs.appendFile(target, body2, err => { err ? reject(err) : resolve(); });
    });

    return fs.writeFile(target, body)
      .then(testerWrap)
      .then(() => fs.readFile(target))
      .then(content => {
        content.should.eql(body + body2);
        return fs.rmdir(pathFn.join(tmpDir, 'a'));
      });
  });

  it('appendFile() - path is required', () => {
    try {
      fs.appendFile();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('appendFileSync()', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';
    const body2 = 'bar';

    return fs.writeFile(target, body).then(() => {
      fs.appendFileSync(target, body2);
      return fs.readFile(target);
    }).then(content => {
      content.should.eql(body + body2);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('appendFileSync() - path is required', () => {
    try {
      fs.appendFileSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('copyFile()', () => {
    const src = pathFn.join(tmpDir, 'test.txt');
    const dest = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    return fs.writeFile(src, body)
      .then(() => fs.copyFile(src, dest))
      .then(() => fs.readFile(dest))
      .then(content => {
        content.should.eql(body);

        return Promise.all([
          fs.unlink(src),
          fs.rmdir(pathFn.join(tmpDir, 'a'))
        ]);
      });
  });

  it('copyFile() - callback', () => {
    const src = pathFn.join(tmpDir, 'test.txt');
    const dest = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    const testerWrap = () => new Promise((resolve, reject) => {
      fs.copyFile(src, dest, err => { err ? reject(err) : resolve(); });
    });

    return fs.writeFile(src, body)
      .then(testerWrap)
      .then(() => fs.readFile(dest))
      .then(content => {
        content.should.eql(body);
        return Promise.all([fs.unlink(src), fs.rmdir(pathFn.join(tmpDir, 'a'))]);
      });
  });

  it('copyFile() - src is required', () => {
    try {
      fs.copyFile();
    } catch (err) {
      err.should.have.property('message', 'src is required!');
    }
  });

  it('copyFile() - dest is required', () => {
    try {
      fs.copyFile('123');
    } catch (err) {
      err.should.have.property('message', 'dest is required!');
    }
  });

  it('copyDir()', () => {
    const src = pathFn.join(tmpDir, 'a');
    const dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(() => fs.copyDir(src, dest)).then(files => {
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
    }).then(result => {
      result.should.eql(['e', 'f', 'h', 'i']);
    }).then(() => Promise.all([
      fs.rmdir(src),
      fs.rmdir(dest)
    ]));
  });

  it('copyDir() - callback', () => {
    const src = pathFn.join(tmpDir, 'a');
    const dest = pathFn.join(tmpDir, 'b');

    const testerWrap = () => new Promise((resolve, reject) => {
      fs.copyDir(src, dest, (err, files) => { err ? reject(err) : resolve(files); });
    });

    return createDummyFolder(src)
      .then(testerWrap)
      .then(files => {
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
        ]).then(result => {
          result.should.eql(['e', 'f', 'h', 'i']);
          return Promise.all([fs.rmdir(src), fs.rmdir(dest)]);
        });
      });
  });

  it('copyDir() - src is required', () => {
    try {
      fs.copyDir();
    } catch (err) {
      err.should.have.property('message', 'src is required!');
    }
  });

  it('copyDir() - dest is required', () => {
    try {
      fs.copyDir('123');
    } catch (err) {
      err.should.have.property('message', 'dest is required!');
    }
  });

  it('copyDir() - ignoreHidden off', () => {
    const src = pathFn.join(tmpDir, 'a');
    const dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src)
      .then(() => fs.copyDir(src, dest, {ignoreHidden: false}))
      .then(files => {
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
      }).then(result => {
        result.should.eql(['a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
      }).then(() => Promise.all([fs.rmdir(src), fs.rmdir(dest)]));
  });

  it('copyDir() - ignorePattern', () => {
    const src = pathFn.join(tmpDir, 'a');
    const dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src)
      .then(() => fs.copyDir(src, dest, {ignorePattern: /\.js/}))
      .then(files => {
        files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);

        return Promise.all([
          fs.readFile(pathFn.join(dest, 'e.txt')),
          fs.readFile(pathFn.join(dest, 'folder', 'h.txt'))
        ]);
      }).then(result => {
        result.should.eql(['e', 'h']);
      }).then(() => Promise.all([fs.rmdir(src), fs.rmdir(dest)]));
  });

  it('listDir()', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => fs.listDir(target))
      .then(files => {
        files.should.have.members([
          'e.txt',
          'f.js',
          pathFn.join('folder', 'h.txt'),
          pathFn.join('folder', 'i.js')
        ]);

        return fs.rmdir(target);
      });
  });

  it('listDir() - callback', () => {
    const target = pathFn.join(tmpDir, 'test');

    const testerWrap = () => new Promise((resolve, reject) => {
      fs.listDir(target, (err, files) => { err ? reject(err) : resolve(files); });
    });

    return createDummyFolder(target)
      .then(testerWrap)
      .then(files => {
        files.should.have.members([
          'e.txt',
          'f.js',
          pathFn.join('folder', 'h.txt'),
          pathFn.join('folder', 'i.js')
        ]);

        return fs.rmdir(target);
      });
  });

  it('listDir() - path is required', () => {
    try {
      fs.listDir();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('listDir() - ignoreHidden off', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => fs.listDir(target, {ignoreHidden: false}))
      .then(files => {
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

  it('listDir() - ignorePattern', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => fs.listDir(target, {ignorePattern: /\.js/}))
      .then(files => {
        files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);
        return fs.rmdir(target);
      });
  });

  it('listDirSync()', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(() => {
      const files = fs.listDirSync(target);
      files.should.have.members([
        'e.txt',
        'f.js',
        pathFn.join('folder', 'h.txt'),
        pathFn.join('folder', 'i.js')
      ]);

      return fs.rmdir(target);
    });
  });

  it('listDirSync() - path is required', () => {
    try {
      fs.listDirSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('listDirSync() - ignoreHidden off', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(() => {
      const files = fs.listDirSync(target, {ignoreHidden: false});
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

  it('listDirSync() - ignorePattern', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(() => {
      const files = fs.listDirSync(target, {ignorePattern: /\.js/});
      files.should.have.members(['e.txt', pathFn.join('folder', 'h.txt')]);
      return fs.rmdir(target);
    });
  });

  it('readFile()', () => {
    const target = pathFn.join(tmpDir, 'test.txt');
    const body = 'test';

    return fs.writeFile(target, body)
      .then(() => fs.readFile(target))
      .then(content => {
        content.should.eql(body);
        return fs.unlink(target);
      });
  });

  it('readFile() - callback', () => {
    const target = pathFn.join(tmpDir, 'test.txt');
    const body = 'test';

    const testerWrap = () => new Promise((resolve, reject) => {
      fs.readFile(target, (err, content) => { err ? reject(err) : resolve(content); });
    });

    return fs.writeFile(target, body)
      .then(testerWrap)
      .then(content => {
        content.should.eql(body);
        return fs.unlink(target);
      });
  });

  it('readFile() - path is required', () => {
    try {
      fs.readFile();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('readFile() - escape BOM', () => {
    const target = pathFn.join(tmpDir, 'test.txt');
    const body = '\ufefffoo';

    return fs.writeFile(target, body)
      .then(() => fs.readFile(target))
      .then(content => {
        content.should.eql('foo');
        return fs.unlink(target);
      });
  });

  it('readFile() - escape Windows line ending', () => {
    const target = pathFn.join(tmpDir, 'test.txt');
    const body = 'foo\r\nbar';

    return fs.writeFile(target, body)
      .then(() => fs.readFile(target))
      .then(content => {
        content.should.eql('foo\nbar');
        return fs.unlink(target);
      });
  });

  it('readFileSync()', () => {
    const target = pathFn.join(tmpDir, 'test.txt');
    const body = 'test';

    return fs.writeFile(target, body).then(() => {
      fs.readFileSync(target).should.eql(body);
      return fs.unlink(target);
    });
  });

  it('readFileSync() - path is required', () => {
    try {
      fs.readFileSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('readFileSync() - escape BOM', () => {
    const target = pathFn.join(tmpDir, 'test.txt');
    const body = '\ufefffoo';

    return fs.writeFile(target, body).then(() => {
      fs.readFileSync(target).should.eql('foo');
      return fs.unlink(target);
    });
  });

  it('readFileSync() - escape Windows line ending', () => {
    const target = pathFn.join(tmpDir, 'test.txt');
    const body = 'foo\r\nbar';

    return fs.writeFile(target, body).then(() => {
      fs.readFileSync(target).should.eql('foo\nbar');
      return fs.unlink(target);
    });
  });

  it('unlink()', () => {
    const target = pathFn.join(tmpDir, 'test-unlink');

    return fs.writeFile(target, '')
      .then(() => fs.exists(target))
      .then(exist => {
        exist.should.eql(true);
        return fs.unlink(target);
      })
      .then(() => fs.exists(target))
      .then(exist => {
        exist.should.eql(false);
      });
  });

  it('emptyDir()', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => fs.emptyDir(target))
      .then(files => {
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
      })
      .map(data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }))
      .then(() => fs.rmdir(target));
  });

  it('emptyDir() - callback', () => {
    const target = pathFn.join(tmpDir, 'test');

    const testerWrap = () => new Promise((resolve, reject) => {
      fs.emptyDir(target, (err, files) => { err ? reject(err) : resolve(files); });
    });

    return createDummyFolder(target)
      .then(testerWrap)
      .then(files => {
        files.should.have.members([
          'e.txt',
          'f.js',
          pathFn.join('folder', 'h.txt'),
          pathFn.join('folder', 'i.js')
        ]);

        return Promise.map([
          [pathFn.join(target, '.hidden', 'a.txt'), true],
          [pathFn.join(target, '.hidden', 'b.js'), true],
          [pathFn.join(target, '.hidden', 'c', 'd'), true],
          [pathFn.join(target, 'e.txt'), false],
          [pathFn.join(target, 'f.js'), false],
          [pathFn.join(target, '.g'), true],
          [pathFn.join(target, 'folder', 'h.txt'), false],
          [pathFn.join(target, 'folder', 'i.js'), false],
          [pathFn.join(target, 'folder', '.j'), true]
        ], data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }));
      })
      .then(() => fs.rmdir(target));
  });

  it('emptyDir() - path is required', () => {
    try {
      fs.emptyDir();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('emptyDir() - ignoreHidden off', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => fs.emptyDir(target, {ignoreHidden: false}))
      .then(files => {
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
      })
      .map(data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }))
      .then(() => fs.rmdir(target));
  });

  it('emptyDir() - ignorePattern', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => fs.emptyDir(target, {ignorePattern: /\.js/}))
      .then(files => {
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
      })
      .map(data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }))
      .then(() => fs.rmdir(target));
  });

  it('emptyDir() - exclude', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => fs.emptyDir(target, {exclude: ['e.txt', pathFn.join('folder', 'i.js')]}))
      .then(files => {
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
      }).map(data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }))
      .then(() => fs.rmdir(target));
  });

  it('emptyDirSync()', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => {
        const files = fs.emptyDirSync(target);
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
      })
      .map(data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }))
      .then(() => fs.rmdir(target));
  });

  it('emptyDirSync() - path is required', () => {
    try {
      fs.emptyDirSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('emptyDirSync() - ignoreHidden off', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => {
        const files = fs.emptyDirSync(target, {ignoreHidden: false});
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
      })
      .map(data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }))
      .then(() => fs.rmdir(target));
  });

  it('emptyDirSync() - ignorePattern', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => {
        const files = fs.emptyDirSync(target, {ignorePattern: /\.js/});
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
      })
      .map(data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }))
      .then(() => fs.rmdir(target));
  });

  it('emptyDirSync() - exclude', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => {
        const files = fs.emptyDirSync(target, {exclude: ['e.txt', pathFn.join('folder', 'i.js')]});
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
      })
      .map(data => fs.exists(data[0]).then(exist => { exist.should.eql(data[1]); }))
      .then(() => fs.rmdir(target));
  });

  it('rmdir()', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target)
      .then(() => fs.rmdir(target))
      .then(() => fs.exists(target))
      .then(exist => {
        exist.should.be.false;
      });
  });

  it('rmdir() - callback', () => {
    const target = pathFn.join(tmpDir, 'test');

    const testerWrap = () => new Promise((resolve, reject) => {
      fs.rmdir(target, err => { err ? reject(err) : resolve(); });
    });

    return createDummyFolder(target)
      .then(testerWrap)
      .then(() => fs.exists(target))
      .then(exist => {
        exist.should.be.false;
      });
  });

  it('rmdir() - path is required', () => {
    try {
      fs.rmdir();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('rmdirSync()', () => {
    const target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(() => {
      fs.rmdirSync(target);
      return fs.exists(target);
    }).then(exist => {
      exist.should.be.false;
    });
  });

  it('rmdirSync() - path is required', () => {
    try {
      fs.rmdirSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('watch()', () => {
    let watcher;
    const target = pathFn.join(tmpDir, 'test.txt');

    const testerWrap = _watcher => new Promise((resolve, reject) => {
      _watcher.on('add', resolve).on('error', reject);
    });

    return fs.watch(tmpDir).then(watcher_ => {
      watcher = watcher_;

      return Promise.all([
        testerWrap(watcher).then(path_ => {
          path_.should.eql(target);
        }),
        fs.writeFile(target, 'test')
      ]);
    }).finally(() => {
      if (watcher) {
        watcher.close();
      }
      return fs.unlink(target);
    });
  });

  it('watch() - path is required', () => {
    try {
      fs.watch();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('ensurePath() - file exists', () => {
    const target = pathFn.join(tmpDir, 'test');

    return Promise.all([
      fs.writeFile(pathFn.join(target, 'foo.txt')),
      fs.writeFile(pathFn.join(target, 'foo-1.txt')),
      fs.writeFile(pathFn.join(target, 'foo-2.md')),
      fs.writeFile(pathFn.join(target, 'bar.txt'))
    ]).then(() => fs.ensurePath(pathFn.join(target, 'foo.txt'))).then(path => {
      path.should.eql(pathFn.join(target, 'foo-2.txt'));
      return fs.rmdir(target);
    });
  });

  it('ensurePath() - file not exist', () => {
    const target = pathFn.join(tmpDir, 'foo.txt');

    return fs.ensurePath(target).then(path => {
      path.should.eql(target);
    });
  });

  it('ensurePath() - callback', () => {
    const target = pathFn.join(tmpDir, 'test');

    const testerWrap = () => new Promise((resolve, reject) => {
      fs.ensurePath(pathFn.join(target, 'foo.txt'), (err, path) => { err ? reject(err) : resolve(path); });
    });

    return Promise.all([
      fs.writeFile(pathFn.join(target, 'foo.txt')),
      fs.writeFile(pathFn.join(target, 'foo-1.txt')),
      fs.writeFile(pathFn.join(target, 'foo-2.md')),
      fs.writeFile(pathFn.join(target, 'bar.txt'))
    ]).then(testerWrap).then(path => {
      path.should.eql(pathFn.join(target, 'foo-2.txt'));
      return fs.rmdir(target);
    });
  });

  it('ensurePath() - path is required', () => {
    try {
      fs.ensurePath();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('ensurePathSync() - file exists', () => {
    const target = pathFn.join(tmpDir, 'test');

    return Promise.all([
      fs.writeFile(pathFn.join(target, 'foo.txt')),
      fs.writeFile(pathFn.join(target, 'foo-1.txt')),
      fs.writeFile(pathFn.join(target, 'foo-2.md')),
      fs.writeFile(pathFn.join(target, 'bar.txt'))
    ]).then(() => {
      const path = fs.ensurePathSync(pathFn.join(target, 'foo.txt'));
      path.should.eql(pathFn.join(target, 'foo-2.txt'));

      return fs.rmdir(target);
    });
  });

  it('ensurePathSync() - file not exist', () => {
    const target = pathFn.join(tmpDir, 'foo.txt');
    const path = fs.ensurePathSync(target);

    path.should.eql(target);
  });

  it('ensurePathSync() - path is required', () => {
    try {
      fs.ensurePathSync();
    } catch (err) {
      err.should.have.property('message', 'path is required!');
    }
  });

  it('ensureWriteStream()', () => {
    const target = pathFn.join(tmpDir, 'foo', 'bar.txt');

    return fs.ensureWriteStream(target).then((stream) => {
      stream.path.should.eql(target);

      const streamPromise = new Promise((resolve, reject) => {
        stream.on('finish', resolve).on('error', reject);
      });

      stream.end();
      return streamPromise;
    }).then(() => fs.unlink(target));
  });

  it('ensureWriteStream() - callback', () => {
    const target = pathFn.join(tmpDir, 'foo', 'bar.txt');

    const testerPromise = new Promise((resolve, reject) => {
      fs.ensureWriteStream(target, (err, stream) => { err ? reject(err) : resolve(stream); });
    });

    return testerPromise.then(stream => {
      stream.path.should.eql(target);

      const streamPromise = new Promise((resolve, reject) => {
        stream.on('finish', resolve).on('error', reject);
      });

      stream.end();
      return streamPromise;
    }).then(() => fs.unlink(target));
  });

  it('ensureWriteStreamSync()', () => {
    const target = pathFn.join(tmpDir, 'foo', 'bar.txt');
    const stream = fs.ensureWriteStreamSync(target);

    stream.path.should.eql(target);

    const streamPromise = new Promise((resolve, reject) => {
      stream.on('finish', resolve).on('error', reject);
    });

    stream.end();
    return streamPromise.then(() => fs.rmdir(pathFn.dirname(target)));
  });
});
