import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended
});

export default [
    js.configs.recommended,
    ...compat.config({
        parser: '@typescript-eslint/parser',
        parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        plugins: ['@typescript-eslint'],
        extends: ['plugin:@typescript-eslint/recommended'],
        env: {
            browser: true,
            es2020: true,
            node: true
        },
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'brace-style': ['error', 'stroustrup']
        }
    })
];
