module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'simple-import-sort', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
    ],
    'simple-import-sort/imports': 'off',
    'simple-import-sort/exports': 'error',
    'import/order': [
      'error',
      {
        'groups': [
          ['builtin', 'external'],
          ['internal'],
          ['parent', 'sibling', 'index']
        ],
        'pathGroups': [
          { 'pattern': '@app/**', 'group': 'internal' },
          { 'pattern': '@common/**', 'group': 'internal' },
          { 'pattern': '@config/**', 'group': 'internal' },
          { 'pattern': '@account/**', 'group': 'internal' },
          { 'pattern': '@auth/**', 'group': 'internal' },
          { 'pattern': '@core/**', 'group': 'internal' },
          { 'pattern': '@env/**', 'group': 'internal' },
          { 'pattern': '@exchange/**', 'group': 'internal' },
          { 'pattern': '@health/**', 'group': 'internal' },
          { 'pattern': '@logger/**', 'group': 'internal' },
          { 'pattern': '@market/**', 'group': 'internal' },
          { 'pattern': '@order/**', 'group': 'internal' },
          { 'pattern': '@position/**', 'group': 'internal' },
          { 'pattern': '@strategy/**', 'group': 'internal' },
          { 'pattern': '@ticker/**', 'group': 'internal' },
          { 'pattern': '@wallet/**', 'group': 'internal' },
          { 'pattern': '@test/**', 'group': 'internal' }
        ],
        'pathGroupsExcludedImportTypes': ['builtin'],
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        },
        'newlines-between': 'always'
      }
    ],
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'never', prev: '*', next: 'throw' },
      { blankLine: 'never', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'never', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      { blankLine: 'always', prev: '*', next: ['if', 'try', 'class', 'function', 'export'] },
      { blankLine: 'always', prev: ['if', 'try', 'class', 'function', 'export'], next: '*' },
      { blankLine: 'never', prev: '*', next: 'return' },
    ],
    'arrow-body-style': ['error', 'as-needed'],
    'prefer-arrow-callback': ['error', { 'allowNamedFunctions': true }],
    'func-style': ['error', 'expression', { 'allowArrowFunctions': true }]
  },
};