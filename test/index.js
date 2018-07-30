'use strict';

require('chai').should();

const pathFn = require('path');
const Promise = require('bluebird');
const fs = require('../lib/fs');
const { tiferr } = require('iferr');

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
      try {
        exist.should.be.true;
      } catch (e) {
        callback(e);
        return;
      }
      callback();
    });
  });

  it('exists() - path is required', () => {
    fs.exists.should.to.throw('path is required!');
  });

  it('mkdirs()', () => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'c');

    return fs.mkdirs(target).then(() => fs.exists(target)).then(exist => {
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('mkdirs() - callback', callback => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'c');

    fs.mkdirs(target, tiferr(callback, () => {
      fs.exists(target, exist => {
        exist.should.be.true;
        return fs.rmdir(pathFn.join(tmpDir, 'a'));
      });
    }));
  });

  it('mkdirs() - path is required', () => {
    fs.mkdirs.should.to.throw('path is required!');
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
    fs.mkdirsSync.should.to.throw('path is required!');
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

  it('writeFile() - callback', callback => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    fs.writeFile(target, body, tiferr(callback, () => {
      fs.readFile(target, tiferr(callback, content => {
        content.should.eql(body);
        fs.rmdir(pathFn.join(tmpDir, 'a'), callback);
      }));
    }));
  });

  it('writeFile() - path is required', () => {
    fs.writeFile.should.to.throw('path is required!');
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
    fs.writeFileSync.should.to.throw('path is required!');
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

  it('appendFile() - callback', callback => {
    const target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';
    const body2 = 'bar';

    fs.writeFile(target, body, tiferr(callback, () => {
      fs.appendFile(target, body2, tiferr(callback, () => {
        fs.readFile(target, tiferr(callback, content => {
          content.should.eql(body + body2);
          fs.rmdir(pathFn.join(tmpDir, 'a'), callback);
        }));
      }));
    }));
  });

  it('appendFile() - path is required', () => {
    fs.appendFile.should.to.throw('path is required!');
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
    fs.appendFileSync.should.to.throw('path is required!');
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

  it('copyFile() - callback', callback => {
    const src = pathFn.join(tmpDir, 'test.txt');
    const dest = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    fs.writeFile(src, body, tiferr(callback, () => {
      fs.copyFile(src, dest, tiferr(callback, () => {
        fs.readFile(dest, tiferr(callback, content => {
          content.should.eql(body);

          Promise.all([
            fs.unlink(src),
            fs.rmdir(pathFn.join(tmpDir, 'a'))
          ]).asCallback(callback);
        }));
      }));
    }));
  });

  it('copyFile() - src is required', () => {
    fs.copyFile.should.to.throw('src is required!');
  });

  it('copyFile() - dest is required', () => {
    (() => fs.copyFile('123')).should.to.throw('dest is required!');
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

  it('copyDir() - callback', callback => {
    const src = pathFn.join(tmpDir, 'a');
    const dest = pathFn.join(tmpDir, 'b');

    createDummyFolder(src).asCallback(callback, () => {
      fs.copyDir(src, dest, tiferr(callback, files => {
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
        ]).asCallback(tiferr(callback, result => {
          result.should.eql(['e', 'f', 'h', 'i']);
          Promise.all([fs.rmdir(src), fs.rmdir(dest)]).asCallback(callback);
        }));
      }));
    });
  });

  it('copyDir() - src is required', () => {
    fs.copyDir.should.to.throw('src is required!');
  });

  it('copyDir() - dest is required', () => {
    (() => fs.copyDir('123')).should.to.throw('dest is required!');
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

  it('listDir() - callback', callback => {
    const target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).asCallback(callback, () => {
      fs.listDir(target, tiferr(callback, files => {
        files.should.have.members([
          'e.txt',
          'f.js',
          pathFn.join('folder', 'h.txt'),
          pathFn.join('folder', 'i.js')
        ]);

        fs.rmdir(target, callback);
      }));
    });
  });

  it('listDir() - path is required', () => {
    fs.listDir.should.to.throw('path is required!');
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
    fs.listDirSync.should.to.throw('path is required!');
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

  it('readFile() - callback', callback => {
    const target = pathFn.join(tmpDir, 'test.txt');
    const body = 'test';

    fs.writeFile(target, body, tiferr(callback, () => {
      fs.readFile(target, tiferr(callback, content => {
        content.should.eql(body);
        fs.unlink(target, callback);
      }));
    }));
  });

  it('readFile() - path is required', () => {
    fs.readFile.should.to.throw('path is required!');
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
    fs.readFileSync.should.to.throw('path is required!');
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

  it('emptyDir() - callback', callback => {
    const target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).asCallback(tiferr(callback, () => {
      fs.emptyDir(target, tiferr(callback, files => {
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
        ], data => {
          return fs.exists(data[0]).then(exist => {
            exist.should.eql(data[1]);
          });
        }).asCallback(tiferr(callback, () => {
          fs.rmdir(target, callback);
        }));
      }));
    }));
  });

  it('emptyDir() - path is required', () => {
    fs.emptyDir.should.to.throw('path is required!');
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
    fs.emptyDirSync.should.to.throw('path is required!');
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

  it('rmdir() - callback', callback => {
    const target = pathFn.join(tmpDir, 'test');

    createDummyFolder(target).asCallback(tiferr(callback, () => {
      fs.rmdir(target, tiferr(callback, () => {
        fs.exists(target, exist => {
          try {
            exist.should.be.false;
          } catch (e) {
            callback(e);
            return;
          }
          callback();
        });
      }));
    }));
  });

  it('rmdir() - path is required', () => {
    fs.rmdir.should.to.throw('path is required!');
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
    fs.rmdirSync.should.to.throw('path is required!');
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
    fs.watch.should.to.throw('path is required!');
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

  it('ensurePath() - callback', callback => {
    const target = pathFn.join(tmpDir, 'test');

    Promise.all([
      fs.writeFile(pathFn.join(target, 'foo.txt')),
      fs.writeFile(pathFn.join(target, 'foo-1.txt')),
      fs.writeFile(pathFn.join(target, 'foo-2.md')),
      fs.writeFile(pathFn.join(target, 'bar.txt'))
    ]).asCallback(tiferr(callback, () => {
      fs.ensurePath(pathFn.join(target, 'foo.txt'), tiferr(callback, path => {
        path.should.eql(pathFn.join(target, 'foo-2.txt'));
        fs.rmdir(target, callback);
      }));
    }));
  });

  it('ensurePath() - path is required', () => {
    fs.ensurePath.should.to.throw('path is required!');
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
    fs.ensurePathSync.should.to.throw('path is required!');
  });

  it('ensureWriteStream()', () => {
    const target = pathFn.join(tmpDir, 'foo', 'bar.txt');

    return fs.ensureWriteStream(target).then(stream => {
      stream.path.should.eql(target);

      const streamPromise = new Promise((resolve, reject) => {
        stream.on('finish', resolve).on('error', reject);
      });

      stream.end();
      return streamPromise;
    }).then(() => fs.unlink(target));
  });

  it('ensureWriteStream() - callback', callback => {
    const target = pathFn.join(tmpDir, 'foo', 'bar.txt');

    fs.ensureWriteStream(target, tiferr(callback, stream => {
      stream.path.should.eql(target);
      stream.on('error', callback);
      stream.on('finish', () => {
        fs.unlink(target, callback);
      });

      stream.end();
    }));
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
