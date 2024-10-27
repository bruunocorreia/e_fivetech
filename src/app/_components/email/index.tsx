import React, { useState } from 'react'
import axios from 'axios'

export const useEmailSender = () => {
  const [loading, setLoading] = useState(false) // Adiciona estado de carregamento
  const [error, setError] = useState('') // Adiciona estado de erro
  const [success, setSuccess] = useState('') // Adiciona estado de sucesso

  const sendEmail = async (to_email, to_name) => {
    setLoading(true) // Inicia o estado de carregamento
    setError('') // Limpa o estado de erro anterior
    setSuccess('') // Limpa o estado de sucesso anterior

    try {
      const response = await axios.post('/api/send-email', {
        from_name: '',
        to_email: to_email,
        to_name: to_name,
      })
      setSuccess('Email enviado com sucesso!') // Define o estado de sucesso
    } catch (err) {
      console.error('Erro ao enviar email:', err)
      setError('Falha ao enviar email. Tente novamente.') // Define o estado de erro
    } finally {
      setLoading(false) // Finaliza o estado de carregamento
    }
  }

  const sendEmailCadastro = async (to_email, to_name, token) => {
    setLoading(true) // Inicia o estado de carregamento
    setError('') // Limpa o estado de erro anterior
    setSuccess('') // Limpa o estado de sucesso anterior

    try {
      const response = await axios.post('/api/send-email-cadastro', {
        from_name: 'admin@minimo.com',
        to_email: to_email,
        to_name: to_name,
        token: token,
      })
      setSuccess('Email enviado com sucesso!') // Define o estado de sucesso
    } catch (err) {
      console.error('Erro ao enviar email:', err)
      setError('Falha ao enviar email. Tente novamente.') // Define o estado de erro
    } finally {
      setLoading(false) // Finaliza o estado de carregamento
    }
  }

  // Função para enviar a Nota Fiscal como anexo no email
  // Função para enviar a Nota Fiscal por email com o PDF em anexo
  const sendNotaFiscalEmail = async (to_email, to_name, pdfBlob) => {
    setLoading(true) // Inicia o estado de carregamento
    setError('') // Limpa o estado de erro anterior
    setSuccess('') // Limpa o estado de sucesso anterior

    try {
      const formData = new FormData()
      formData.append('pdf', pdfBlob, 'nota_fiscal.pdf')
      formData.append('to_email', to_email)
      formData.append('to_name', to_name)
      formData.append('subject', 'Sua Nota Fiscal Eletrônica')
      formData.append('message', 'Segue em anexo a sua Nota Fiscal Eletrônica.')

      await axios.post('/api/send-email-nota-fiscal', formData)
      setSuccess('Nota Fiscal enviada com sucesso!') // Define o estado de sucesso
    } catch (err) {
      console.error('Erro ao enviar a Nota Fiscal:', err)
      setError('Falha ao enviar a Nota Fiscal. Tente novamente.') // Define o estado de erro
    } finally {
      setLoading(false) // Finaliza o estado de carregamento
    }
  }

  return { sendEmail, sendEmailCadastro, sendNotaFiscalEmail, loading, error, success }
}
