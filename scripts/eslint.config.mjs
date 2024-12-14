import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/coverage/**',
      '**/node_modules/**',
      'packages/*/dist/**',
      'packages/eslint-config-custom/**',
      '**/dist/*',
      '**/build/*',
      '**/.turbo/*',
      'playground',
      'packages/*/examples',
      '.idea',
      '.vscode',
      '.turbo',
      '.next',
      '.cache',
      '.yalc',
      'pnpm-lock.json',
      '**/integration/templates/**/*',
      'commitlint.config.ts',
      'vitest.workspace.mjs',
    ],
  },
  ...compat.extends('@clerk/custom/node', '@clerk/custom/typescript'),
  {
    rules: {
      'import/no-unresolved': [
        'error',
        {
          ignore: ['^#'],
        },
      ],
    },
  },
];
