import * as chai from 'chai';
import { join, dirname } from 'path';
import BlueBirdPromise from 'bluebird';
import * as fs from '../lib/fs.js';
import type { FSWatcher } from 'chokidar';
import { fileURLToPath } from 'url';
const should = chai.should();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createDummyFolder(path: string) {
  const filesMap = {
    // Normal files in a hidden folder
    [join('.hidden', 'a.txt')]: 'a',
    [join('.hidden', 'b.js')]: 'b',
    // Normal folder in a hidden folder
    [join('.hidden', 'c', 'd')]: 'd',
    // Top-class files
    'e.txt': 'e',
    'f.js': 'f',
    // A hidden file
    '.g': 'g',
    // Files in a normal folder
    [join('folder', 'h.txt')]: 'h',
    [join('folder', 'i.js')]: 'i',
    // A hidden files in a normal folder
    [join('folder', '.j')]: 'j'
  };
  return BlueBirdPromise.map(Object.keys(filesMap), key => fs.writeFile(join(path, key), filesMap[key]));
}

function createAnotherDummyFolder(path: string) {
  const filesMap = {
    [join('folder', '.txt')]: 'txt',
    [join('folder', '.js')]: 'js'
  };
  return BlueBirdPromise.map(Object.keys(filesMap), key => fs.writeFile(join(path, key), filesMap[key]));
}

describe('fs', () => {
  const tmpDir = join(__dirname, 'fs_tmp');

  before(() => fs.mkdirs(tmpDir));

  after(() => fs.rmdir(tmpDir));

  it('exists()', async () => {
    const exist = await fs.exists(tmpDir);
    chai.expect(exist).to.eql(true);
  });

  it('exists() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.exists();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('existsSync()', () => {
    const exist = fs.existsSync(tmpDir);
    chai.expect(exist).to.eql(true);
  });

  it('existsSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.existsSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('existsSync() - not exist', () => {
    const exist = fs.existsSync(join(__dirname, 'fs_tmp1'));
    chai.expect(exist).to.eql(false);
  });

  it('mkdirs()', async () => {
    const target = join(tmpDir, 'a', 'b', 'c');

    await fs.mkdirs(target);
    const exist = await fs.exists(target);
    chai.expect(exist).to.eql(true);

    await fs.rmdir(join(tmpDir, 'a'));
  });

  it('mkdirs() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.mkdirs();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('mkdirsSync()', async () => {
    const target = join(tmpDir, 'a', 'b', 'c');

    fs.mkdirsSync(target);

    const exist = await fs.exists(target);
    chai.expect(exist).to.eql(true);

    await fs.rmdir(join(tmpDir, 'a'));
  });

  it('mkdirsSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.mkdirsSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('writeFile()', async () => {
    const target = join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    await fs.writeFile(target, body);
    const result = await fs.readFile(target);

    chai.expect(result).to.eql(body);

    await fs.rmdir(join(tmpDir, 'a'));
  });

  it('writeFile() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.writeFile();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('writeFileSync()', async () => {
    const target = join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    fs.writeFileSync(target, body);

    const result = await fs.readFile(target);
    chai.expect(result).to.eql(body);

    await fs.rmdir(join(tmpDir, 'a'));
  });

  it('writeFileSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.writeFileSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('appendFile()', async () => {
    const target = join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';
    const body2 = 'bar';

    await fs.writeFile(target, body);
    await fs.appendFile(target, body2);

    const result = await fs.readFile(target);

    chai.expect(result).to.eql(body + body2);

    await fs.rmdir(join(tmpDir, 'a'));
  });

  it('appendFile() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.appendFile();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('appendFileSync()', async () => {
    const target = join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';
    const body2 = 'bar';

    await fs.writeFile(target, body);
    fs.appendFileSync(target, body2);

    const result = await fs.readFile(target);
    chai.expect(result).to.eql(body + body2);

    await fs.rmdir(join(tmpDir, 'a'));
  });

  it('appendFileSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.appendFileSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('copyFile()', async () => {
    const src = join(tmpDir, 'test.txt');
    const dest = join(tmpDir, 'a', 'b', 'test.txt');
    const body = 'foo';

    await fs.writeFile(src, body);
    await fs.copyFile(src, dest);

    const result = await fs.readFile(dest);
    chai.expect(result).to.eql(body);

    await BlueBirdPromise.all([
      fs.unlink(src),
      fs.rmdir(join(tmpDir, 'a'))
    ]);
  });

  it('copyFile() - src is required', async () => {
    try {
      // @ts-expect-error
      await fs.copyFile();
      should.fail();
    } catch (err) {
      err.message.should.eql('src is required!');
    }
  });

  it('copyFile() - dest is required', async () => {
    try {
      // @ts-expect-error
      await fs.copyFile('123');
      should.fail();
    } catch (err) {
      err.message.should.eql('dest is required!');
    }
  });

  it('copyDir()', async () => {
    const src = join(tmpDir, 'a');
    const dest = join(tmpDir, 'b');

    const filenames = [
      'e.txt',
      'f.js',
      join('folder', 'h.txt'),
      join('folder', 'i.js')
    ];

    await createDummyFolder(src);
    const files = await fs.copyDir(src, dest);
    chai.expect(files).to.eql(filenames);

    const result: string[] = [];
    for (const file of files) {
      const output = await fs.readFile(join(dest, file)) as string;
      result.push(output);
    }
    chai.expect(result).to.eql(['e', 'f', 'h', 'i']);

    await BlueBirdPromise.all([fs.rmdir(src), fs.rmdir(dest)]);
  });

  it('copyDir() - src is required', async () => {
    try {
      // @ts-expect-error
      await fs.copyDir();
      should.fail();
    } catch (err) {
      err.message.should.eql('src is required!');
    }
  });

  it('copyDir() - dest is required', async () => {
    try {
      // @ts-expect-error
      await fs.copyDir('123');
      should.fail();
    } catch (err) {
      err.message.should.eql('dest is required!');
    }
  });

  it('copyDir() - ignoreHidden off', async () => {
    const src = join(tmpDir, 'a');
    const dest = join(tmpDir, 'b');

    const filenames = [
      join('.hidden', 'a.txt'),
      join('.hidden', 'b.js'),
      join('.hidden', 'c', 'd'),
      'e.txt',
      'f.js',
      '.g',
      join('folder', 'h.txt'),
      join('folder', 'i.js'),
      join('folder', '.j')
    ];

    await createDummyFolder(src);
    const files = await fs.copyDir(src, dest, { ignoreHidden: false });
    chai.expect(files).to.have.members(filenames);

    const result: string[] = [];
    for (const file of files) {
      const output = await fs.readFile(join(dest, file)) as string;
      result.push(output);
    }
    chai.expect(result).to.have.members(['a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);

    await BlueBirdPromise.all([fs.rmdir(src), fs.rmdir(dest)]);
  });

  it('copyDir() - ignorePattern', async () => {
    const src = join(tmpDir, 'a');
    const dest = join(tmpDir, 'b');

    const filenames = ['e.txt', join('folder', 'h.txt')];

    await createDummyFolder(src);
    const files = await fs.copyDir(src, dest, { ignorePattern: /\.js/ });
    chai.expect(files).to.eql(filenames);

    const result: string[] = [];
    for (const file of files) {
      const output = await fs.readFile(join(dest, file)) as string;
      result.push(output);
    }
    chai.expect(result).to.eql(['e', 'h']);

    await BlueBirdPromise.all([fs.rmdir(src), fs.rmdir(dest)]);
  });

  it('listDir()', async () => {
    const expected = [
      'e.txt',
      'f.js',
      join('folder', 'h.txt'),
      join('folder', 'i.js')
    ];
    const target = join(tmpDir, 'test');

    await createDummyFolder(target);
    const dir = await fs.listDir(target);
    chai.expect(dir).to.eql(expected);

    await fs.rmdir(target);
  });

  it('listDir() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.listDir();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('listDir() - ignoreHidden off', async () => {
    const target = join(tmpDir, 'test');

    const filenames = [
      join('.hidden', 'a.txt'),
      join('.hidden', 'b.js'),
      join('.hidden', 'c', 'd'),
      'e.txt',
      'f.js',
      '.g',
      join('folder', 'h.txt'),
      join('folder', 'i.js'),
      join('folder', '.j')
    ];

    await createDummyFolder(target);
    const dir = await fs.listDir(target, { ignoreHidden: false });
    chai.expect(dir).to.have.members(filenames);

    await fs.rmdir(target);
  });

  it('listDir() - ignorePattern', async () => {
    const target = join(tmpDir, 'test');

    await createDummyFolder(target);
    const dir = await fs.listDir(target, { ignorePattern: /\.js/ });
    chai.expect(dir).to.eql(['e.txt', join('folder', 'h.txt')]);

    await fs.rmdir(target);
  });

  it('listDirSync()', async () => {
    const target = join(tmpDir, 'test');

    const filenames = [
      'e.txt',
      'f.js',
      join('folder', 'h.txt'),
      join('folder', 'i.js')
    ];

    await createDummyFolder(target);
    const files = fs.listDirSync(target);
    chai.expect(files).to.eql(filenames);

    await fs.rmdir(target);
  });

  it('listDirSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.listDirSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('listDirSync() - ignoreHidden off', async () => {
    const target = join(tmpDir, 'test');

    const filenames = [
      join('.hidden', 'a.txt'),
      join('.hidden', 'b.js'),
      join('.hidden', 'c', 'd'),
      'e.txt',
      'f.js',
      '.g',
      join('folder', 'h.txt'),
      join('folder', 'i.js'),
      join('folder', '.j')
    ];

    await createDummyFolder(target);
    const files = fs.listDirSync(target, { ignoreHidden: false });
    chai.expect(files).to.have.members(filenames);

    await fs.rmdir(target);
  });

  it('listDirSync() - ignorePattern', async () => {
    const target = join(tmpDir, 'test');

    await createDummyFolder(target);
    const files = fs.listDirSync(target, { ignorePattern: /\.js/ });
    chai.expect(files).to.eql(['e.txt', join('folder', 'h.txt')]);

    await fs.rmdir(target);
  });

  it('readFile()', async () => {
    const target = join(tmpDir, 'test.txt');
    const body = 'test';

    await fs.writeFile(target, body);
    const result = await fs.readFile(target);
    chai.expect(result).to.eql(body);

    await fs.unlink(target);
  });

  it('readFile() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.readFile();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('readFile() - escape BOM', async () => {
    const target = join(tmpDir, 'test.txt');
    const body = '\ufefffoo';

    await fs.writeFile(target, body);
    const result = await fs.readFile(target);

    chai.expect(result).to.eql('foo');

    await fs.unlink(target);
  });

  it('readFile() - escape Windows line ending', async () => {
    const target = join(tmpDir, 'test.txt');
    const body = 'foo\r\nbar';

    await fs.writeFile(target, body);
    const result = await fs.readFile(target);
    chai.expect(result).to.eql('foo\nbar');

    await fs.unlink(target);
  });

  it('readFile() - do not escape', async () => {
    const target = join(tmpDir, 'test.txt');
    const body = 'foo\r\nbar';

    await fs.writeFile(target, body);
    const result = await fs.readFile(target, { escape: '' });
    chai.expect(result).to.eql('foo\r\nbar');

    await fs.unlink(target);
  });

  it('readFileSync()', async () => {
    const target = join(tmpDir, 'test.txt');
    const body = 'test';

    await fs.writeFile(target, body);
    const result = fs.readFileSync(target);
    chai.expect(result).to.eql(body);

    await fs.unlink(target);
  });

  it('readFileSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.readFileSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('readFileSync() - escape BOM', async () => {
    const target = join(tmpDir, 'test.txt');
    const body = '\ufefffoo';

    await fs.writeFile(target, body);
    const result = fs.readFileSync(target);
    chai.expect(result).to.eql('foo');

    await fs.unlink(target);
  });

  it('readFileSync() - escape Windows line ending', async () => {
    const target = join(tmpDir, 'test.txt');
    const body = 'foo\r\nbar';

    await fs.writeFile(target, body);
    const result = fs.readFileSync(target);
    chai.expect(result).to.eql('foo\nbar');

    await fs.unlink(target);
  });

  it('readFileSync() - do not escape', async () => {
    const target = join(tmpDir, 'test.txt');
    const body = 'foo\r\nbar';

    await fs.writeFile(target, body);
    const result = fs.readFileSync(target, { escape: '' });
    chai.expect(result).to.eql('foo\r\nbar');

    await fs.unlink(target);
  });

  it('unlink()', async () => {
    const target = join(tmpDir, 'test-unlink');

    await fs.writeFile(target, '');
    let exist = await fs.exists(target);
    chai.expect(exist).to.eql(true);

    await fs.unlink(target);
    exist = await fs.exists(target);
    chai.expect(exist).to.eql(false);
  });

  it('emptyDir()', async () => {
    const target = join(tmpDir, 'test');

    const checkExistsMap = {
      [join('.hidden', 'a.txt')]: true,
      [join('.hidden', 'b.js')]: true,
      [join('.hidden', 'c', 'd')]: true,
      'e.txt': false,
      'f.js': false,
      '.g': true,
      [join('folder', 'h.txt')]: false,
      [join('folder', 'i.js')]: false,
      [join('folder', '.j')]: true
    };

    await createDummyFolder(target);
    const files = await fs.emptyDir(target);
    chai.expect(files).to.eql([
      'e.txt',
      'f.js',
      join('folder', 'h.txt'),
      join('folder', 'i.js')
    ]);

    const paths = Object.keys(checkExistsMap);
    for (const path of paths) {
      const exist = await fs.exists(join(target, path));
      chai.expect(exist).to.eql(checkExistsMap[path]);
    }

    await fs.rmdir(target);
  });

  it('emptyDir() - empty nothing', async () => {
    const target = join(tmpDir, 'test');

    const checkExistsMap = {
      [join('folder', '.txt')]: true,
      [join('folder', '.js')]: true
    };

    await createAnotherDummyFolder(target);
    const files = await fs.emptyDir(target);
    chai.expect(files).to.eql([]);

    const paths = Object.keys(checkExistsMap);
    for (const path of paths) {
      const exist = await fs.exists(join(target, path));
      chai.expect(exist).to.eql(checkExistsMap[path]);
    }

    await fs.rmdir(target);
  });

  it('emptyDir() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.emptyDir();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('emptyDir() - ignoreHidden off', async () => {
    const target = join(tmpDir, 'test');

    const filenames = [
      join('.hidden', 'a.txt'),
      join('.hidden', 'b.js'),
      join('.hidden', 'c', 'd'),
      'e.txt',
      'f.js',
      '.g',
      join('folder', 'h.txt'),
      join('folder', 'i.js'),
      join('folder', '.j')
    ];

    await createDummyFolder(target);
    const files = await fs.emptyDir(target, { ignoreHidden: false });
    chai.expect(files).to.have.members(filenames);

    for (const file of files) {
      const exist = await fs.exists(join(target, file));
      chai.expect(exist).to.eql(false);
    }

    await fs.rmdir(target);
  });

  it('emptyDir() - ignorePattern', async () => {
    const target = join(tmpDir, 'test');

    const checkExistsMap = {
      [join('.hidden', 'a.txt')]: true,
      [join('.hidden', 'b.js')]: true,
      [join('.hidden', 'c', 'd')]: true,
      'e.txt': false,
      'f.js': true,
      '.g': true,
      [join('folder', 'h.txt')]: false,
      [join('folder', 'i.js')]: true,
      [join('folder', '.j')]: true
    };

    await createDummyFolder(target);
    const files = await fs.emptyDir(target, { ignorePattern: /\.js/ });
    chai.expect(files).to.eql(['e.txt', join('folder', 'h.txt')]);

    const paths = Object.keys(checkExistsMap);
    for (const path of paths) {
      const exist = await fs.exists(join(target, path));
      chai.expect(exist).to.eql(checkExistsMap[path]);
    }

    await fs.rmdir(target);
  });

  it('emptyDir() - exclude', async () => {
    const target = join(tmpDir, 'test');

    const checkExistsMap = {
      [join('.hidden', 'a.txt')]: true,
      [join('.hidden', 'b.js')]: true,
      [join('.hidden', 'c', 'd')]: true,
      'e.txt': true,
      'f.js': false,
      '.g': true,
      [join('folder', 'h.txt')]: false,
      [join('folder', 'i.js')]: true,
      [join('folder', '.j')]: true
    };

    await createDummyFolder(target);
    const files = await fs.emptyDir(target, { exclude: ['e.txt', join('folder', 'i.js')] });
    chai.expect(files).to.eql(['f.js', join('folder', 'h.txt')]);

    const paths = Object.keys(checkExistsMap);
    for (const path of paths) {
      const exist = await fs.exists(join(target, path));
      chai.expect(exist).to.eql(checkExistsMap[path]);
    }

    await fs.rmdir(target);
  });

  it('emptyDirSync()', async () => {
    const target = join(tmpDir, 'test');

    const checkExistsMap = {
      [join('.hidden', 'a.txt')]: true,
      [join('.hidden', 'b.js')]: true,
      [join('.hidden', 'c', 'd')]: true,
      'e.txt': false,
      'f.js': false,
      '.g': true,
      [join('folder', 'h.txt')]: false,
      [join('folder', 'i.js')]: false,
      [join('folder', '.j')]: true
    };

    await createDummyFolder(target);
    const files = fs.emptyDirSync(target);
    chai.expect(files).to.eql([
      'e.txt',
      'f.js',
      join('folder', 'h.txt'),
      join('folder', 'i.js')
    ]);

    const paths = Object.keys(checkExistsMap);
    for (const path of paths) {
      const exist = await fs.exists(join(target, path));
      chai.expect(exist).to.eql(checkExistsMap[path]);
    }

    await fs.rmdir(target);
  });

  it('emptyDirSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.emptyDirSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('emptyDirSync() - ignoreHidden off', async () => {
    const target = join(tmpDir, 'test');

    const filenames = [
      join('.hidden', 'a.txt'),
      join('.hidden', 'b.js'),
      join('.hidden', 'c', 'd'),
      'e.txt',
      'f.js',
      '.g',
      join('folder', 'h.txt'),
      join('folder', 'i.js'),
      join('folder', '.j')
    ];

    await createDummyFolder(target);
    const files = fs.emptyDirSync(target, { ignoreHidden: false });
    chai.expect(files).to.have.members(filenames);

    for (const file of files) {
      const exist = await fs.exists(join(target, file));
      chai.expect(exist).to.eql(false);
    }

    await fs.rmdir(target);
  });

  it('emptyDirSync() - ignorePattern', async () => {
    const target = join(tmpDir, 'test');

    const checkExistsMap = {
      [join('.hidden', 'a.txt')]: true,
      [join('.hidden', 'b.js')]: true,
      [join('.hidden', 'c', 'd')]: true,
      'e.txt': false,
      'f.js': true,
      '.g': true,
      [join('folder', 'h.txt')]: false,
      [join('folder', 'i.js')]: true,
      [join('folder', '.j')]: true
    };

    await createDummyFolder(target);
    const files = fs.emptyDirSync(target, { ignorePattern: /\.js/ });
    chai.expect(files).to.eql(['e.txt', join('folder', 'h.txt')]);

    const paths = Object.keys(checkExistsMap);
    for (const path of paths) {
      const exist = await fs.exists(join(target, path));
      chai.expect(exist).to.eql(checkExistsMap[path]);
    }

    await fs.rmdir(target);
  });

  it('emptyDirSync() - exclude', async () => {
    const target = join(tmpDir, 'test');

    const checkExistsMap = {
      [join('.hidden', 'a.txt')]: true,
      [join('.hidden', 'b.js')]: true,
      [join('.hidden', 'c', 'd')]: true,
      'e.txt': true,
      'f.js': false,
      '.g': true,
      [join('folder', 'h.txt')]: false,
      [join('folder', 'i.js')]: true,
      [join('folder', '.j')]: true
    };

    await createDummyFolder(target);
    const files = fs.emptyDirSync(target, { exclude: ['e.txt', join('folder', 'i.js')] });
    chai.expect(files).to.eql(['f.js', join('folder', 'h.txt')]);

    const paths = Object.keys(checkExistsMap);
    for (const path of paths) {
      const exist = await fs.exists(join(target, path));
      chai.expect(exist).to.eql(checkExistsMap[path]);
    }

    await fs.rmdir(target);
  });

  it('rmdir()', async () => {
    const target = join(tmpDir, 'test');

    await createDummyFolder(target);
    await fs.rmdir(target);
    const exist = await fs.exists(target);
    chai.expect(exist).to.eql(false);
  });

  it('rmdir() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.rmdir();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('rmdirSync()', async () => {
    const target = join(tmpDir, 'test');

    await createDummyFolder(target);
    fs.rmdirSync(target);
    const exist = await fs.exists(target);
    chai.expect(exist).to.eql(false);
  });

  it('rmdirSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.rmdirSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('watch()', async () => {
    const target = join(tmpDir, 'test.txt');

    const testerWrap = (_watcher: FSWatcher) => new BlueBirdPromise<string>((resolve, reject) => {
      _watcher.on('add', resolve).on('error', reject);
    });

    const watcher = await fs.watch(tmpDir);
    const result = await BlueBirdPromise.all([
      testerWrap(watcher),
      fs.writeFile(target, 'test')
    ]);
    chai.expect(result[0]).to.eql(target);

    if (watcher) {
      watcher.close();
    }
    await fs.unlink(target);
  });

  it('watch() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.watch();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('ensurePath() - file exists', async () => {
    const target = join(tmpDir, 'test');
    const filenames = ['foo.txt', 'foo-1.txt', 'foo-2.md', 'bar.txt'];

    await BlueBirdPromise.map(filenames, path => fs.writeFile(join(target, path)));
    const result = await fs.ensurePath(join(target, 'foo.txt'));
    chai.expect(result).to.eql(join(target, 'foo-2.txt'));

    await fs.rmdir(target);
  });

  it('ensurePath() - file not exist', async () => {
    const target = join(tmpDir, 'foo.txt');
    const result = await fs.ensurePath(target);
    chai.expect(result).to.eql(target);
  });

  it('ensurePath() - path is required', async () => {
    try {
      // @ts-expect-error
      await fs.ensurePath();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('ensurePathSync() - file exists', async () => {
    const target = join(tmpDir, 'test');
    const filenames = ['foo.txt', 'foo-1.txt', 'foo-2.md', 'bar.txt'];

    await BlueBirdPromise.map(filenames, path => fs.writeFile(join(target, path)));
    const path = fs.ensurePathSync(join(target, 'foo.txt'));
    chai.expect(path).to.eql(join(target, 'foo-2.txt'));

    await fs.rmdir(target);
  });

  it('ensurePathSync() - file not exist', () => {
    const target = join(tmpDir, 'foo.txt');
    const path = fs.ensurePathSync(target);

    chai.expect(path).to.eql(target);
  });

  it('ensurePathSync() - path is required', () => {
    try {
      // @ts-expect-error
      fs.ensurePathSync();
      should.fail();
    } catch (err) {
      err.message.should.eql('path is required!');
    }
  });

  it('ensureWriteStream()', async () => {
    const { promisify } = await import('util');
    const { finished: finishedFn } = await import('stream');
    const finished = promisify(finishedFn);

    const target = join(tmpDir, 'foo', 'bar.txt');

    const stream = await fs.ensureWriteStream(target);
    chai.expect(stream.path).to.eql(target);

    stream.end();
    await finished(stream);

    await fs.unlink(target);
  });

  it('ensureWriteStreamSync()', callback => {
    const target = join(tmpDir, 'foo', 'bar.txt');
    const stream = fs.ensureWriteStreamSync(target);

    chai.expect(stream.path).to.eql(target);

    stream.on('error', callback);
    stream.on('close', () => {
      fs.rmdir(dirname(target)).asCallback(callback);
    });

    stream.end();
  });
});
