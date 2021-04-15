// node_modules/.cache/eslint-loader
module.exports = {
  "env": {
    "browser": true,
    "node": true
  },
  "extends": "standard",
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-new": "off",
    "indent": "off",
    '@typescript-eslint/indent': ['error', 2],
  }
};
