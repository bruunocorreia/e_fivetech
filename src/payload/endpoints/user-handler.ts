import { Router } from 'express'
import payload from 'payload'

const router = Router()

router.post('/update-user', async (req, res) => {
  try {
    // Atualizando o campo "average" do usuário
    const updateUserResult = await payload.update({
      collection: 'users',
      id: req.body.id,
      data: {
        birthdate: req.body.birthdate,
        email: req.body.email,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        socialId: req.body.socialId,
      },
    })

    return res.json(updateUserResult)
  } catch (error: unknown) {
    // Capturando detalhes do erro
    let errorMessage = 'An unknown error occurred'
    if (error instanceof Error) {
      errorMessage = error.message // Mensagem do erro
    }

    console.error('Error updating user:', error) // Log detalhado no servidor

    return res.status(500).json({ message: 'Internal server error', details: errorMessage })
  }
})

export default router
