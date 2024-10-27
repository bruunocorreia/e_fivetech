import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import payload from 'payload'

const router = Router()

// Rota para enviar e-mails usando EmailJS
/* eslint-disable @typescript-eslint/no-unused-vars */
router.post('/api/send-email-nota-fiscal', async (req, res) => {
  // Desestruture os parâmetros do corpo da requisição
  const { from_name, to_email, to_name, pdf_path } = req.body

  // Template de e-mail
  const emailTemplate = `
  <p>Olá ${to_name},</p>
  <p>Estamos muito felizes em dar as boas-vindas à nossa família da Minimo 1! 🎉</p>
  <p>Agradecemos por sua recente compra e por escolher nossa loja para renovar seu guarda-roupa. Sabemos que você vai adorar as peças que selecionou e mal podemos esperar para vê-lo arrasando com seu novo visual.</p>
  <p>Em anexo, você encontrará a sua Nota Fiscal em formato PDF. Por favor, guarde-a para referência futura.</p>
  <p>Atenciosamente,</p>
  <p>Equipe Minimo 1</p>
  `

  try {
    // Verifica se o arquivo PDF existe no caminho especificado
    const pdfExists = fs.existsSync(pdf_path)
    if (!pdfExists) {
      return res.status(404).send({ message: 'Arquivo PDF não encontrado.' })
    }

    // Envia o e-mail com o PDF anexado
    await payload.sendEmail({
      from: from_name,
      to: to_email,
      subject: 'Bem-vindo à Minimo 1! Sua compra foi um sucesso!',
      html: emailTemplate,
      attachments: [
        {
          filename: 'Nota_Fiscal.pdf',
          path: pdf_path, // Caminho para o arquivo PDF
          contentType: 'application/pdf'
        }
      ]
    })

    res.status(200).send({ message: 'Nota fiscal enviada com sucesso!' })
  } catch (error) {
    res.status(500).send({ message: 'Erro ao enviar o e-mail.', error: error.message })
  }
})

export default router
/* eslint-enable @typescript-eslint/no-unused-vars */
