import axios from 'axios'
import { Router } from 'express'

const router = Router()

router.get('/nfe/:id/pdf', async (req, res) => {
  const apiKey = process.env.PLUGNOTAS_API_KEY // Defina sua API Key no arquivo .env

  const nfeId = req.params.id

  // Log do ID da NF-e recebida
  console.log(`Solicitando PDF da NF-e com ID: ${nfeId}`)

  try {
    const response = await axios.get(`https://api.sandbox.plugnotas.com.br/nfe/${nfeId}/pdf`, {
      headers: {
        'x-api-key': apiKey,
      },
      responseType: 'arraybuffer', // Necessário para receber dados binários
    })

    // Log da resposta
    console.log('PDF da NF-e recebido com sucesso.')

    // Configurar os headers da resposta
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="nfe_${nfeId}.pdf"`,
    })

    // Enviar o PDF para o cliente
    res.send(response.data)
  } catch (error) {
    // Log detalhado do erro
    console.error('Erro ao obter o PDF da NF-e:', error.response?.data || error.message)

    res.status(500).json({
      error: 'Falha ao obter o PDF da NF-e. Por favor, verifique o ID e tente novamente.',
      details: error.response?.data || error.message,
    })
  }
})

export default router
