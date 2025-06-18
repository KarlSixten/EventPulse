import js from '@eslint/js';
import sveltePlugin from 'eslint-plugin-svelte';
import globals from 'globals';


export default [
  js.configs.recommended,
  ...sveltePlugin.configs['flat/recommended'],

  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      }
    }
  }
];