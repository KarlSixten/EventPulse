import js from '@eslint/js';
import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
});

export default [
  js.configs.recommended,

  ...compat.extends('airbnb-base'),

  {
    files: ['eslint.config.js'],
    rules: {
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
      }],
    },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'import/extensions': ['error', 'always', {
        ignorePackages: true,
      }],
    },
  },
];
