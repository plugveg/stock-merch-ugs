import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import tsparser from '@typescript-eslint/parser'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import css from '@eslint/css'
import { defineConfig } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default defineConfig([
  {
    ignores: ['convex/_generated/**', 'dist/**', 'coverage/**', 'src/index.css'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js, '@stylistic': stylistic, prettier: prettierPlugin, react: pluginReact },
    extends: ['js/recommended'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tsparser,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...prettierConfig.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'error',
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'always' }],
      'jsx-quotes': ['error', 'prefer-double'],
      'prettier/prettier': 'error',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
    },
  },
  tseslint.configs.eslintRecommended,
  tseslint.configs.stylistic,
  {
    ...pluginReact.configs.flat.jsxRuntime,
    files: ['**/*.{jsx,tsx}'],
  },
  { files: ['**/*.json'], ...json.configs.recommended },
  { files: ['**/*.jsonc'], ...json.configs.recommended },
  { files: ['**/*.json5'], ...json.configs.recommended },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
    rules: {
      'markdown/no-duplicate-headings': 'error',
    },
  },
  {
    files: ['CHANGELOG.md'],
    rules: {
      'markdown/no-duplicate-headings': 'off',
      'markdown/no-multiple-h1': 'off',
      'markdown/heading-increment': 'off',
      'markdown/no-missing-label-refs': 'off',
    },
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
])
