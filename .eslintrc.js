module.exports = {
  root: true,
  extends: ['plugin:@next/next/recommended', '@payloadcms'],
  ignorePatterns: ['**/payload-types.ts'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
    'no-console': 'off',
    'import/named': 'off', // Adicione esta regra se necessário, mas com cautela
    '@next/next/no-async-client-component': 'warn' // Mudando a regra que estava causando o warning para um aviso
  },
};
