import js from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ECMA_VERSION = 2021,
  JAVASCRIPT_FILES = ['*.js', '*.jsx', '*.cjs', '*.mjs'],
  TEST_FILES = ['*.test.js', '*.test.jsx', '*.test.ts', '*.test.tsx', 'test/**', '__tests__/**'],
  TYPESCRIPT_FILES = ['*.ts', '*.tsx', '*.mts'],
  YAML_FILES = ['*.yml', '*.yaml'];

export default tseslint.config([
  {
    ignores: [
      '.cache',
      '.idea',
      '.next',
      '.turbo',
      '.vscode',
      '.yalc',
      '**/.turbo/*',
      '**/build/*',
      '**/coverage/*',
      '**/dist/*',
      '**/integration/templates/**/*',
      '**/node_modules/**',
      'commitlint.config.ts',
      'packages/*/dist/**',
      'packages/*/examples',
      'packages/eslint-config-custom/**',
      'playground',
      'pnpm-lock.json',
      'vitest.workspace.mjs',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: ECMA_VERSION,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      curly: ['error', 'all'],
      'sort-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: [...JAVASCRIPT_FILES, ...TYPESCRIPT_FILES],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              message: "Please always import from '@clerk/shared/<module>' instead of '@clerk/shared'.",
              name: '@clerk/shared',
            },
          ],
          patterns: [
            {
              group: ['!@clerk/shared/*'],
              message: 'ignore this line -- eslint matching workaround to allow all imports except @clerk/shared',
            },
            {
              group: ['@emotion/*'],
              message:
                'Please do not import emotion directly. Import helpers from ./design-system or ./primitives instead.',
            },
          ],
        },
      ],
      'simple-import-sort/imports': 'error',
    },
  },
]);
