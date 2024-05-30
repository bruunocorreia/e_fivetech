module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@next/next/recommended',
    '@payloadcms',
    'plugin:@typescript-eslint/recommended'
  ],
  ignorePatterns: ['**/payload-types.ts'],
  plugins: ['prettier', '@typescript-eslint'],
  rules: {
    'prettier/prettier': ['error', { 
      semi: false, 
      endOfLine: 'auto',
      requirePragma: false,
      insertPragma: false,
      singleQuote: true,
      trailingComma: 'all'
    }],
    'no-console': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description'
      }
    ]
  },
}
