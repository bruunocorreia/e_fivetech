/* eslint-disable @typescript-eslint/no-implicit-any-catch */

import { Router } from 'express'
import MercadoPago, { Payment } from 'mercadopago'

const router = Router()

router.get('/payment-status', async (req, res) => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN

    if (!accessToken) {
      return res.status(500).json({ error: 'Access Token não configurado.' })
    }

    // Inicializa o cliente do Mercado Pago
    const mercadoPago = new MercadoPago({
      accessToken: accessToken,
      options: { timeout: 5000 },
    })

    // Obtém o payment_id dos parâmetros de consulta e garante que seja uma string
    const paymentId = Array.isArray(req.query.payment_id)
      ? req.query.payment_id[0]
      : req.query.payment_id

    if (typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'O parâmetro payment_id deve ser uma string.' })
    }

    // Cria uma instância de Payment
    const payment = new Payment(mercadoPago)

    // Obtém as informações do pagamento
    const result = await payment.get({ id: paymentId })

    // Envia a resposta com as informações do pagamento
    res.json(result)
  } catch (error) {
    console.error('Erro ao obter status do pagamento:', error)
    res.status(500).json({
      message: 'Falha ao obter status do pagamento. Por favor, tente novamente.',
      error: error.message,
    })
  }
})

export default router
