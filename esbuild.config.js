const esbuild = require('esbuild');
const path = require('path');

const config = {
  entryPoints: ['src/js/index.js'],
  bundle: true,
  outdir: 'dist',
  format: 'iife',
  target: 'es2018',
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.svg': 'file',
    '.wav': 'file',
    '.mp3': 'file',
    '.ogg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.ttf': 'file',
    '.otf': 'file',
    '.eot': 'file'
  },
  publicPath: './',
  assetNames: '[dir]/[name]',
  chunkNames: '[name]',
  entryNames: '[name]',
  write: true,
  sourcemap: true,
  minify: process.env.MINIFY === 'true'
};

// Export for use as a module
module.exports = config;

// If run directly, build the project
if (require.main === module) {
  if (process.argv.includes('--watch')) {
    // Development mode with watch
    esbuild.context(config).then(ctx => {
      ctx.watch();
      console.log('Watching for changes...');
    });
  } else {
    // Production build
    esbuild.build(config).catch((err) => { console.error(err); process.exit(1); });
  }
}