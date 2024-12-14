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
    ignores: ['!**/.*.js', '**/*.snap', 'templates/**/*'],
  },
  ...compat.extends('@clerk/custom/node', '@clerk/custom/typescript', '@clerk/custom/playwright'),
  {
    rules: {
      'playwright/expect-expect': 'off',
      'playwright/no-skipped-test': 'off',
      'playwright/no-page-pause': 'warn',
    },
  },
  {
    files: ['./models/deployment.ts', './testUtils/emailService.ts'],

    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    },
  },
  {
    files: ['./testUtils/testAgainstRunningApps.ts', './presets/longRunningApps.ts'],

    rules: {
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
    },
  },
];
