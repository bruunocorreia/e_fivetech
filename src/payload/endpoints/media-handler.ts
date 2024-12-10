import { Router } from 'express'
import payload from 'payload'

const router = Router()

router.post('/resize-media', async (req, res) => {
  try {
    // Result will be the updated Post document.
    // Atualizando o campo "average" do usuário
    const updateUserResult = await payload.update({
      collection: 'media',
      id: req.body.id,
      data: {
        X_position: req.body.X_position,
        Y_position: req.body.Y_position,
        zoom: req.body.zoom,
      },
    })

    return res.json(updateUserResult)
  } catch (error: unknown) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
