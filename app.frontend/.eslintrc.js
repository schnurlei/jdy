module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/base',
    '@vue/standard',
    '@vue/typescript',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    "indent": ["error", 4, { "SwitchCase": 1 }],
    "no-use-before-define": ["warn", { "functions": true, "classes": false }],
    "@typescript-eslint/no-use-before-define": ["warn", { "functions": true, "classes": false }],
    'semi': [1, "always"],
    'padded-blocks': ['off', { 'blocks': 'always' }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
  },
  plugins: ['@typescript-eslint']
}
