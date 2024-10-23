const policies = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://checkout.stripe.com',
    'https://js.stripe.com',
    'https://maps.googleapis.com',
    'https://*.mercadopago.com/',
    'https://*.mercadolibre.com/',
    'https://http2.mlstatic.com', // Adicionado mlstatic.com aqui
  ],
  'child-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': [
    "'self'",
    'https://*.stripe.com',
    'https://raw.githubusercontent.com',
    'https://*.mercadolivre.com/',
    'https://*.mercadopago.com/',
    'https://*.mercadolibre.com/',
    'https://http2.mlstatic.com', // Adicionado mlstatic.com aqui
  ],
  'font-src': ["'self'"],
  'frame-src': [
    "'self'",
    'https://checkout.stripe.com',
    'https://js.stripe.com',
    'https://hooks.stripe.com',
    'https://*.mercadopago.com/',
    'https://*.mercadolibre.com/',
    'https://http2.mlstatic.com', // Adicionado mlstatic.com aqui
  ],
  'connect-src': [
    "'self'",
    'https://checkout.stripe.com',
    'https://api.stripe.com',
    'https://maps.googleapis.com',
    'https://*.mercadopago.com/',
    'https://api.mercadolibre.com/',
    'https://*.mercadolibre.com/',
    'https://http2.mlstatic.com', // Adicionado mlstatic.com aqui
  ],
}

module.exports = Object.entries(policies)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key} ${value.join(' ')}`
    }
    return ''
  })
  .join('; ')
