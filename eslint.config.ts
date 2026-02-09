import js from '@eslint/js'
import globals from 'globals'
import css from '@eslint/css'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import pluginReact from 'eslint-plugin-react'
import tsparser from '@typescript-eslint/parser'
import stylistic from '@stylistic/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import perfectionist from 'eslint-plugin-perfectionist'

export default defineConfig([
  {
    ignores: ['convex/_generated/**', 'dist/**', 'coverage/**', 'src/index.css'],
  },
  {
    extends: ['js/recommended'],
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tsparser,
    },
    plugins: { '@stylistic': stylistic, js, perfectionist, prettier: prettierPlugin, react: pluginReact },
    rules: {
      ...prettierConfig.rules,
      '@stylistic/quotes': ['error', 'single', { allowTemplateLiterals: 'always', avoidEscape: true }],
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'jsx-quotes': ['error', 'prefer-double'],
      'no-console': 'error',
      'no-undef': 'error',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'perfectionist/sort-imports': 'error',
      'perfectionist/sort-interfaces': ['error'],
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'alphabetical',
        },
      ],
      'prettier/prettier': 'error',
    },
    settings: {
      perfectionist: {
        partitionByComment: true,
        type: 'line-length',
      },
      react: { version: 'detect' },
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
    extends: ['markdown/recommended'],
    files: ['**/*.md'],
    language: 'markdown/gfm',
    plugins: { markdown },
    rules: {
      'markdown/no-duplicate-headings': 'error',
    },
  },
  {
    files: ['CHANGELOG.md'],
    rules: {
      'markdown/heading-increment': 'off',
      'markdown/no-duplicate-headings': 'off',
      'markdown/no-missing-label-refs': 'off',
      'markdown/no-multiple-h1': 'off',
    },
  },
  {
    extends: ['css/recommended'],
    files: ['**/*.css'],
    language: 'css/css',
    plugins: { css },
  },
])
