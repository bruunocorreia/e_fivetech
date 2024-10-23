import axios from 'axios'
import { Router } from 'express'

const router = Router()

router.post('/enviar-nfe', async (req, res) => {
  const apiKey = process.env.PLUGNOTAS_API_KEY

  // Obtenha os dados da NF-e do corpo da requisição
  const nfeData = req.body

  // Log dos dados recebidos
  console.log('Dados recebidos para enviar NF-e:', JSON.stringify(nfeData, null, 2))

  try {
    const response = await axios.post('https://api.sandbox.plugnotas.com.br/nfe', [nfeData], {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    // Log da resposta da API
    console.log('Resposta da API PlugNotas:', JSON.stringify(response.data, null, 2))

    res.json(response.data)
  } catch (error: unknown) {
    // Log detalhado do erro
    if (axios.isAxiosError(error)) {
      console.error('Erro ao enviar NF-e:', error.response?.data || error.message)
      res.status(500).json({
        error: 'Falha ao enviar NF-e. Por favor, verifique os dados e tente novamente.',
        details: error.response?.data || error.message,
      })
    } else {
      console.error('Erro desconhecido:', (error as Error).message)
      res.status(500).json({
        error: 'Erro desconhecido ao enviar NF-e.',
        details: (error as Error).message,
      })
    }
  }
})

export default router
