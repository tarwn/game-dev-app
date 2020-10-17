module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json']
  },
  plugins: [
    '@typescript-eslint',
    'svelte3',
    'editorconfig'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    es6: true,
    node: true,
    browser: true
  },
  ignorePatterns: [
    '/public',
    '/dist',
    'rollup.config.js',
    '.eslintrc.js',
    'tsconfig.js',
    'svelte.config.js'
  ],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  settings: {},
  rules: {
    "semi": "error",
    "brace-style": ["error", "stroustrup"],
    "editorconfig/editorconfig": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off"
  }
};
