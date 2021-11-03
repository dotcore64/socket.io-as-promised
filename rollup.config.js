import pkg from './package.json';

const input = 'src/index.js';
const external = Object.keys(pkg.dependencies);

export default [{
  input,
  external,
  // sourcemaps help generate coverage reports for the actual sources using istanbul
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'default',
  },
}, {
  input,
  external,
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
  },
}];
