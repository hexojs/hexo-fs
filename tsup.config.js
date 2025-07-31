import { defineConfig } from 'tsup';
import packageJson from './package.json' assert { type: 'json' };

// Packages that should be bundled
const bundledPackages = ['p-limit', 'deepmerge-ts', 'hexo-is', 'is-stream', 'markdown-it', 'node-cache'];

const externalDeps = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies)].filter(
  (pkgName) => !bundledPackages.includes(pkgName)
);

export default defineConfig({
  entry: ['lib/fs.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  external: externalDeps,
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
});
