import axios from 'axios';
import { Router } from 'express';

const router = Router();

// Cancelamento de etiquetas
router.post('/cancel-labels', async (req, res) => {
  const { order } = req.body;
  const { order_id, reason_id, description } = order; // Destructuring para extrair valores de 'order'

  try {
    const response = await axios.post(
      'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/cancel',
      {
        order: {
          id: order_id,
          reason_id: reason_id,
          description: description,
        },
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.SHIPPING_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Aplicação nicosathler@hotmail.com',
        },
      }
    );
    // Log da resposta em caso de sucesso
    console.log('Label cancel successfully:', response.data);
    res.json(response.data);
  } catch (error: unknown) {
    console.error('Error canceling label:', error);
    if (error instanceof Error) {
      res.status(500).send(`Failed to cancel label: ${error.message}. Please try again.`);
    } else {
      res.status(500).send('Failed to cancel label. Please try again.');
    }
  }
});

export default router;
