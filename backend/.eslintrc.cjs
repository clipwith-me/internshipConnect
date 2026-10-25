// ESLint 8 config for the backend (ESM, Node >= 18).
module.exports = {
  root: true,
  env: { node: true, es2022: true, jest: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  extends: ['eslint:recommended'],
  ignorePatterns: ['node_modules/', 'uploads/', 'coverage/'],
  rules: {
    // Unused function arguments are common in Express (req, res, next).
    'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
};
