import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess, { scss } from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import { argv } from "yargs";
import copy from 'rollup-plugin-copy'
import del from "del";

const production = !process.env.ROLLUP_WATCH;

const config = {
  dest: "dist",
  bundleName: "bundle.js"
};

del.sync(`${config.dest}/**`);

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      const options = ['run', 'dev:server:start', '--', '--dev'];
      if (argv.port) {
        options.push("--port");
        options.push(argv.port);
      }
      server = require('child_process').spawn('npm', options, {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

function transform(contents) {
  // const scriptTag = '<script type="module" defer src="/build/main.js"></script>';
  // const bundleTag = '<script defer src="/build/bundle.js"></script>';
  // return contents.toString().replace('__SCRIPT__', dynamicImports ? scriptTag : bundleTag);
  const bundleTag = `<script defer src="/${config.bundleName}"></script>`;
  return contents.toString().replace('__SCRIPT__', bundleTag);
}

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    //dir: config.dest,
    file: `${config.dest}/${config.bundleName}`
  },
  plugins: [
    copy({
      targets: [
        { src: [`public/*`, "!*/(index.html)"], dest: config.dest },
        { src: [`public/index.html`], dest: config.dest, rename: 'index.html', transform },
      ],
      copyOnce: true,
      flatten: false
    }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css: css => {
        css.write('bundle.css');
      },
      preprocess: sveltePreprocess({ postcss: true }),
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('dist'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
