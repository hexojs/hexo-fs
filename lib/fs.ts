import type { Dirent, WriteFileOptions } from 'fs';
import chokidar, { WatchOptions } from 'chokidar';
import BlueBirdPromise from 'bluebird';
import { dirname, join, extname, basename } from 'path';
import { escapeRegExp } from 'hexo-util';

import fs from 'graceful-fs';

const fsPromises = fs.promises;

const rEOL = /\r\n/g;

export function exists(path: string) {
  if (!path) throw new TypeError('path is required!');
  const promise = fsPromises.access(path).then(() => true, error => {
    if (error.code !== 'ENOENT') throw error;
    return false;
  });

  return BlueBirdPromise.resolve(promise);
}

export function existsSync(path: string) {
  if (!path) throw new TypeError('path is required!');

  try {
    fs.accessSync(path);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    return false;
  }

  return true;
}

export function mkdirs(path: string) {
  if (!path) throw new TypeError('path is required!');

  return BlueBirdPromise.resolve(fsPromises.mkdir(path, { recursive: true }));
}

export function mkdirsSync(path: string) {
  if (!path) throw new TypeError('path is required!');

  fs.mkdirSync(path, { recursive: true });
}

function checkParent(path: string) {
  return BlueBirdPromise.resolve(fsPromises.mkdir(dirname(path), { recursive: true }));
}

export function writeFile(
  path: string,
  data: any,
  options?: WriteFileOptions
) {
  if (!path) throw new TypeError('path is required!');

  if (!data) data = '';

  return checkParent(path)
    .then(() => fsPromises.writeFile(path, data, options));
}


export function writeFileSync(path: string, data: any, options?: WriteFileOptions) {
  if (!path) throw new TypeError('path is required!');

  fs.mkdirSync(dirname(path), { recursive: true });
  fs.writeFileSync(path, data, options);
}

export function appendFile(
  path: string,
  data: any,
  options?: WriteFileOptions) {
  if (!path) throw new TypeError('path is required!');

  return checkParent(path)
    .then(() => fsPromises.appendFile(path, data, options));
}

export function appendFileSync(path: string, data: any, options?: WriteFileOptions) {
  if (!path) throw new TypeError('path is required!');

  fs.mkdirSync(dirname(path), { recursive: true });
  fs.appendFileSync(path, data, options);
}

export function copyFile(
  src: string, dest: string, flags?: number) {
  if (!src) throw new TypeError('src is required!');
  if (!dest) throw new TypeError('dest is required!');

  return checkParent(dest)
    .then(() => fsPromises.copyFile(src, dest, flags));
}

const trueFn = () => true as const;

function ignoreHiddenFiles(ignore?: boolean) {
  if (!ignore) return trueFn;

  return ({ name }) => !name.startsWith('.');
}

function ignoreFilesRegex(regex?: RegExp) {
  if (!regex) return trueFn;

  return ({ name }) => !regex.test(name);
}

function ignoreExcludeFiles(arr: any[], parent: string) {
  if (!arr || !arr.length) return trueFn;

  const set = new Set(arr);

  return ({ name }) => !set.has(join(parent, name));
}

export type ReadDirOptions = {
  encoding?: BufferEncoding | null
  withFileTypes?: false
  ignoreHidden?: boolean
  ignorePattern?: RegExp
}

async function _readAndFilterDir(
  path: string, options: ReadDirOptions = {}): Promise<Dirent[]> {
  const { ignoreHidden = true, ignorePattern } = options;
  return (await fsPromises.readdir(path, { ...options, withFileTypes: true }))
    .filter(ignoreHiddenFiles(ignoreHidden))
    .filter(ignoreFilesRegex(ignorePattern));
}

function _readAndFilterDirSync(path: string, options?: ReadDirOptions) {
  const { ignoreHidden = true, ignorePattern } = options;
  return fs.readdirSync(path, { ...options, withFileTypes: true })
    .filter(ignoreHiddenFiles(ignoreHidden))
    .filter(ignoreFilesRegex(ignorePattern));
}

async function _copyDirWalker(
  src: string, dest: string, results: any[], parent: string,
  options: ReadDirOptions) {
  return BlueBirdPromise.map(_readAndFilterDir(src, options), item => {
    const childSrc = join(src, item.name);
    const childDest = join(dest, item.name);
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      return _copyDirWalker(childSrc, childDest, results, currentPath, options);
    }
    results.push(currentPath);
    return copyFile(childSrc, childDest, 0);
  });
}

export function copyDir(
  src: string, dest: string, options: ReadDirOptions = {}) {
  if (!src) throw new TypeError('src is required!');
  if (!dest) throw new TypeError('dest is required!');

  const results = [];

  return checkParent(dest)
    .then(() => _copyDirWalker(src, dest, results, '', options))
    .return(results);
}

async function _listDirWalker(
  path: string, results: any[], parent?: string, options?: ReadDirOptions) {
  const promises = [];

  for (const item of await _readAndFilterDir(path, options)) {
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      promises.push(
        _listDirWalker(join(path, item.name), results, currentPath, options));
    } else {
      results.push(currentPath);
    }
  }

  await BlueBirdPromise.all(promises);
}

export function listDir(
  path: string, options: ReadDirOptions = {}) {
  if (!path) throw new TypeError('path is required!');

  const results = [];

  return BlueBirdPromise.resolve(_listDirWalker(path, results, '', options))
    .return(results);
}

function _listDirSyncWalker(
  path: string, results: any[], parent: string, options: ReadDirOptions) {
  for (const item of _readAndFilterDirSync(path, options)) {
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      _listDirSyncWalker(join(path, item.name), results, currentPath, options);
    } else {
      results.push(currentPath);
    }
  }
}

export function listDirSync(path: string, options: ReadDirOptions = {}) {
  if (!path) throw new TypeError('path is required!');
  const results = [];

  _listDirSyncWalker(path, results, '', options);

  return results;
}

export function escapeEOL(str: string) {
  return str.replace(rEOL, '\n');
}

export function escapeBOM(str: string) {
  return str.charCodeAt(0) === 0xFEFF ? str.substring(1) : str;
}

export function escapeFileContent(content) {
  return escapeBOM(escapeEOL(content));
}

export type ReadFileOptions = { encoding?: BufferEncoding | null; flag?: string; escape?: string }

async function _readFile(path: string, options: ReadFileOptions | null = {}) {
  if (!Object.prototype.hasOwnProperty.call(options,
    'encoding')) options.encoding = 'utf8';

  const content = await fsPromises.readFile(path, options);

  if (options.escape == null || options.escape) {
    return escapeFileContent(content);
  }

  return content;
}

export function readFile(
  path: string, options?: ReadFileOptions | null) {
  if (!path) throw new TypeError('path is required!');

  return BlueBirdPromise.resolve(_readFile(path, options));
}

export function readFileSync(path: string, options: ReadFileOptions = {}) {
  if (!path) throw new TypeError('path is required!');

  if (!Object.prototype.hasOwnProperty.call(options,
    'encoding')) options.encoding = 'utf8';

  const content = fs.readFileSync(path, options);

  if (options.escape == null || options.escape) {
    return escapeFileContent(content);
  }

  return content;
}

async function _emptyDir(
  path: string, parent?: string,
  options?: ReadDirOptions & { exclude?: any[] }) {
  const entries = (await _readAndFilterDir(path, options)).filter(
    ignoreExcludeFiles(options.exclude, parent));
  const results = [];

  await BlueBirdPromise.map(entries, (item: Dirent) => {
    const fullPath = join(path, item.name);
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      return _emptyDir(fullPath, currentPath, options).then(files => {
        if (!files.length) {
          return fsPromises.rmdir(fullPath);
        }
        results.push(...files);
      });
    }
    results.push(currentPath);
    return fsPromises.unlink(fullPath);
  });

  return results;
}

export function emptyDir(
  path: string, options: ReadDirOptions & { exclude?: any[] } = {}) {
  if (!path) throw new TypeError('path is required!');

  return BlueBirdPromise.resolve(_emptyDir(path, '', options));
}

function _emptyDirSync(
  path: string, options: ReadDirOptions & { exclude?: any[] },
  parent?: string) {
  const entries = _readAndFilterDirSync(path, options)
    .filter(ignoreExcludeFiles(options.exclude, parent));

  const results = [];

  for (const item of entries) {
    const childPath = join(path, item.name);
    const currentPath = join(parent, item.name);

    if (item.isDirectory()) {
      const removed = _emptyDirSync(childPath, options, currentPath);

      if (!fs.readdirSync(childPath).length) {
        rmdirSync(childPath);
      }

      results.push(...removed);
    } else {
      fs.unlinkSync(childPath);
      results.push(currentPath);
    }
  }

  return results;
}

export function emptyDirSync(
  path: string, options: ReadDirOptions & { exclude?: any[] } = {}) {
  if (!path) throw new TypeError('path is required!');

  return _emptyDirSync(path, options, '');
}

async function _rmdir(path: string) {
  const files = fsPromises.readdir(path, { withFileTypes: true });
  await BlueBirdPromise.map(files, (item: Dirent) => {
    const childPath = join(path, item.name);

    return item.isDirectory() ? _rmdir(childPath) : fsPromises.unlink(
      childPath);
  });
  return fsPromises.rmdir(path);
}

export function rmdir(path: string) {
  if (!path) throw new TypeError('path is required!');

  return BlueBirdPromise.resolve(_rmdir(path));
}

function _rmdirSync(path: string) {
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

export function rmdirSync(path: string) {
  if (!path) throw new TypeError('path is required!');

  _rmdirSync(path);
}

export function watch(
  path: string | ReadonlyArray<string>, options?: WatchOptions) {
  if (!path) throw new TypeError('path is required!');

  const watcher = chokidar.watch(path, options);

  return new BlueBirdPromise((resolve, reject) => {
    watcher.on('ready', resolve);
    watcher.on('error', reject);
  }).thenReturn(watcher);
}

function _findUnusedPath(path: string, files: string[]): string {
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

async function _ensurePath(path: string): Promise<string> {
  if (!await exists(path)) return path;

  const files = await fsPromises.readdir(dirname(path));
  return _findUnusedPath(path, files);
}

export function ensurePath(path: string) {
  if (!path) throw new TypeError('path is required!');

  return BlueBirdPromise.resolve(_ensurePath(path));
}

export function ensurePathSync(path: string) {
  if (!path) throw new TypeError('path is required!');
  if (!fs.existsSync(path)) return path;

  const files = fs.readdirSync(dirname(path));

  return _findUnusedPath(path, files);
}

export function ensureWriteStream(path: string, options?: BufferEncoding | {
  flags?: string;
  encoding?: BufferEncoding;
  fd?: number;
  mode?: number;
  autoClose?: boolean;
  emitClose?: boolean;
  start?: number;
  highWaterMark?: number;
}) {
  if (!path) throw new TypeError('path is required!');

  return checkParent(path)
    .then(() => fs.createWriteStream(path, options));
}

export function ensureWriteStreamSync(path: string, options?: BufferEncoding | {
  flags?: string;
  encoding?: BufferEncoding;
  fd?: number;
  mode?: number;
  autoClose?: boolean;
  emitClose?: boolean;
  start?: number;
  highWaterMark?: number;
}) {
  if (!path) throw new TypeError('path is required!');

  fs.mkdirSync(dirname(path), { recursive: true });
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

export const access = BlueBirdPromise.promisify(fs.access);
export const accessSync = fs.accessSync;

// chmod
export const chmod = BlueBirdPromise.promisify(fs.chmod);
export const chmodSync = fs.chmodSync;
export const fchmod = BlueBirdPromise.promisify(fs.fchmod);
export const fchmodSync = fs.fchmodSync;
export const lchmod = BlueBirdPromise.promisify(fs.lchmod);
export const lchmodSync = fs.lchmodSync;

// chown
export const chown = BlueBirdPromise.promisify(fs.chown);
export const chownSync = fs.chownSync;
export const fchown = BlueBirdPromise.promisify(fs.fchown);
export const fchownSync = fs.fchownSync;
export const lchown = BlueBirdPromise.promisify(fs.lchown);
export const lchownSync = fs.lchownSync;

// close
export const close = BlueBirdPromise.promisify(fs.close);
export const closeSync = fs.closeSync;

// createStream
export const createReadStream = fs.createReadStream;
export const createWriteStream = fs.createWriteStream;

// fsync
export const fsync = BlueBirdPromise.promisify(fs.fsync);
export const fsyncSync = fs.fsyncSync;

// link
export const link = BlueBirdPromise.promisify(fs.link);
export const linkSync = fs.linkSync;

// mkdir
export const mkdir = BlueBirdPromise.promisify(fs.mkdir);
export const mkdirSync = fs.mkdirSync;

// open
export const open = BlueBirdPromise.promisify(fs.open);
export const openSync = fs.openSync;

// symlink
export const symlink = BlueBirdPromise.promisify(fs.symlink);
export const symlinkSync = fs.symlinkSync;

// read
export const read = BlueBirdPromise.promisify(fs.read);
export const readSync = fs.readSync;

// readdir
export const readdir = BlueBirdPromise.promisify(fs.readdir);
export const readdirSync = fs.readdirSync;

// readlink
export const readlink = BlueBirdPromise.promisify(fs.readlink);
export const readlinkSync = fs.readlinkSync;

// realpath
export const realpath = BlueBirdPromise.promisify(fs.realpath);
export const realpathSync = fs.realpathSync;

// rename
export const rename = BlueBirdPromise.promisify(fs.rename);
export const renameSync = fs.renameSync;

// stat
export const stat = BlueBirdPromise.promisify(fs.stat);
export const statSync = fs.statSync;
export const fstat = BlueBirdPromise.promisify(fs.fstat);
export const fstatSync = fs.fstatSync;
export const lstat = BlueBirdPromise.promisify(fs.lstat);
export const lstatSync = fs.lstatSync;

// truncate
export const truncate = BlueBirdPromise.promisify(fs.truncate);
export const truncateSync = fs.truncateSync;
export const ftruncate = BlueBirdPromise.promisify(fs.ftruncate);
export const ftruncateSync = fs.ftruncateSync;

// unlink
export const unlink = BlueBirdPromise.promisify(fs.unlink);
export const unlinkSync = fs.unlinkSync;

// utimes
export const utimes = BlueBirdPromise.promisify(fs.utimes);
export const utimesSync = fs.utimesSync;
export const futimes = BlueBirdPromise.promisify(fs.futimes);
export const futimesSync = fs.futimesSync;

// watch
export const watchFile = fs.watchFile;
export const unwatchFile = fs.unwatchFile;

// write
export const write = BlueBirdPromise.promisify(fs.write);
export const writeSync = fs.writeSync;

// Static classes
export const Stats = fs.Stats;
export const ReadStream = fs.ReadStream;
export const WriteStream = fs.WriteStream;
