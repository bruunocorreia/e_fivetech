/* eslint-disable @typescript-eslint/no-unused-vars */

import { Router } from 'express'
import payload from 'payload'

const router = Router()

router.post('/send-email-nota-fiscal', async (req, res) => {
  const { from_name, to_email, to_name, pdf } = req.body

  const emailTemplate = `
    <p>Olá ${to_name},</p>
    <p>Estamos muito felizes em dar as boas-vindas à nossa família da Minimo 1! 🎉</p>
    <p>Agradecemos por sua recente compra e por escolher nossa loja para renovar seu guarda-roupa. Sabemos que você vai adorar as peças que selecionou e mal podemos esperar para vê-lo arrasando com seu novo visual.</p>
    <p>Em anexo, você encontrará a sua Nota Fiscal em formato PDF. Por favor, guarde-a para referência futura.</p>
    <p>Atenciosamente,</p>
    <p>Equipe Minimo 1</p>
  `

  await payload.sendEmail({
    from_name: from_name,
    to: to_email,
    subject: 'Bem-vindo à Minimo 1! Aqui está sua nota fiscal!',
    html: emailTemplate,
    attachments: [pdf],
  })
})

export default router
/* eslint-enable @typescript-eslint/no-unused-vars */
