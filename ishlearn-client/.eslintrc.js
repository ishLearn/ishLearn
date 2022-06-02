module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/vue3-essential', '@vue/typescript/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    semi: 0,
    quotes: [2, 'single', 'avoid-escape'],
    'vuejs-accessibility/label-has-for': 0,
    'implicit-arrow-linebreak': 0,
    'import/extensions': 0,
  },
}
