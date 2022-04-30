const input = 'src/index.js';

export default [{
  input,
  // sourcemaps help generate coverage reports for the actual sources using istanbul
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'default',
  },
}, {
  input,
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
  },
}];
