import { Payment, StatusScreen, initMercadoPago } from '@mercadopago/sdk-react'
import React, { useState } from 'react'

import axios from 'axios'
import { useAuth } from '../../_providers/Auth'
import { useCart } from '../../_providers/Cart'
import { useEmailSender } from '../../_components/email'
import { useRouter } from 'next/navigation'

initMercadoPago('TEST-e4e31358-531f-4c4d-bd5c-3e77edc4ee3f', { locale: 'pt-BR' })

export const PaymentGateway = ({ amount, serviceId, shippingData, userData, zipCode }) => {
  const router = useRouter()
  const [orderIds, setOrderIds] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentId, setPaymentId] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  const { sendEmail, sendNotaFiscalEmail } = useEmailSender()
  const { user } = useAuth()
  const { cart, cartTotal } = useCart()
  const [showPixMessage, setShowPixMessage] = useState(false)
  const transactionDescription = 'Minimo1'

  const validateCartItems = (items) => {
    const errors = []
    items.forEach((item, index) => {
      if (!item.selectedSize) {
        errors.push({ field: `items.${index}.selectedSize`, message: 'Este campo é obrigatório.' })
      }
      if (!item.selectedColor) {
        errors.push({ field: `items.${index}.selectedColor`, message: 'Este campo é obrigatório.' })
      }
    })
    return errors
  }

  const updateProductStock = async (items) => {
    console.log('Iniciando a atualização do estoque...')
    try {
      for (const item of items) {
        const { product, quantity } = item
  
        // Caso o item do produto seja um ID em vez do objeto completo
        const productId = typeof product === 'string' ? product : product.id
  
        if (!productId) throw new Error(`Produto inválido: ${JSON.stringify(product)}`)
  
        console.log(`Buscando dados do produto ${productId}...`)
  
        // Buscando dados do produto atual para obter o estoque atual
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`)
        const productData = await res.json()
  
        if (!productData?.stock) {
          throw new Error(`Estoque não encontrado para o produto ${productId}`)
        }
  
        const currentStock = productData.stock
        const updatedStock = currentStock - quantity
  
        if (updatedStock < 0) {
          throw new Error(
            `Estoque insuficiente para o produto ${productId}. Estoque atual: ${currentStock}, quantidade solicitada: ${quantity}`
          )
        }
  
        console.log(
          `Atualizando estoque do produto ${productId}: Estoque atual = ${currentStock}, Quantidade = ${quantity}, Estoque atualizado = ${updatedStock}`
        )
  
        // Atualizando o campo `stock` com o novo valor
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`, {
          method: 'PATCH',
          body: JSON.stringify({ stock: updatedStock }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
  
        if (!response.ok) {
          throw new Error(`Erro ao atualizar o estoque do produto ${productId}: ${await response.text()}`)
        }
  
        console.log(`Estoque atualizado para o produto ${productId}:`, await response.json())
      }
      console.log('Atualização do estoque concluída com sucesso.')
    } catch (err) {
      console.error('Erro ao atualizar o estoque:', err.message)
      throw new Error('Erro ao atualizar o estoque dos produtos.')
    }
  }
  

  const generateAndSendNotaFiscal = async (order) => {
    // (A lógica da nota fiscal permanece inalterada)
  }

  const proceedWithOrder = async (paymentResponse) => {
    try {
      console.log('Iniciando o fluxo de processamento do pedido...')

      // Atualiza o estoque como a primeira operação
      console.log('Atualizando o estoque dos produtos...')
      await updateProductStock(cart.items)

      // Realiza a criação do pedido
      const shippingTicketUrl = await completeFreightPurchase()

      const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total: cartTotal.raw,
          items: (cart?.items || []).map(({ product, quantity, selectedColor, selectedSize }) => ({
            product: typeof product === 'string' ? product : product.id,
            quantity,
            selectedSize,
            selectedColor,
            price: typeof product === 'object' ? product.price : undefined,
          })),
          shippingTicket: shippingTicketUrl,
          shippingZipCode: zipCode,
          shippingHouseNumber: shippingData?.houseNumber,
          shippingComplement: shippingData?.complement,
          userName: userData?.name,
          userMail: userData?.email,
          userSocialId: userData?.socialId,
          userPhoneNumber: userData?.phoneNumber,
        }),
      })

      if (!orderReq.ok) {
        const errorMessage = await orderReq.text()
        console.error('Erro ao criar o pedido:', errorMessage)
        throw new Error('Erro ao criar o pedido.')
      }

      const order = await orderReq.json()
      console.log('Pedido criado com sucesso:', order)

      // Gera a Nota Fiscal
      console.log('Gerando e enviando a Nota Fiscal...')
      await generateAndSendNotaFiscal(order)

      sendEmail(userData.email, userData.name)

      console.log('Fluxo de pedido concluído com sucesso.')
      router.push(`/order-confirmation?order_id=${order.id}`)
    } catch (err) {
      console.error('Erro ao processar o pedido:', err.message)
      throw err
    }
  }

  const completeFreightPurchase = async () => {
    setLoading(true)
    setError('')
    // (A lógica do frete permanece inalterada)
  }

  const onSubmit = async ({ formData }) => {
    const errors = validateCartItems(cart?.items || [])
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      console.log('Iniciando o fluxo de pagamento...')
      const paymentData = {
        ...formData,
        description: transactionDescription,
        transaction_amount: parseFloat(amount.toFixed(2)),
      }

      const response = await axios.post('/api/process-payment', { paymentData })
      const paymentResponse = response.data

      if (paymentResponse && paymentResponse.id) {
        setPaymentId(paymentResponse.id)
        console.log('Pagamento processado:', paymentResponse)
      } else {
        throw new Error('Falha no processamento do pagamento')
      }

      if (paymentResponse.status === 'approved') {
        // Pagamento aprovado, prossegue com o fluxo
        await proceedWithOrder(paymentResponse)
      } else if (paymentResponse.payment_method_id === 'pix') {
        // (A lógica do PIX permanece inalterada)
      } else {
        setError('Pagamento não aprovado. Por favor, tente novamente.')
        router.push(`/order-confirmation?error=${encodeURIComponent('Pagamento não aprovado.')}`)
      }
    } catch (err) {
      console.error('Erro durante o processo de pagamento:', err)
      setError(`Falha durante o processo de pagamento: ${err.message || err}`)
    }
  }

  return (
    <div>
      {!paymentId ? (
        <div>
          <Payment
            initialization={{ amount }}
            customization={{
              paymentMethods: { bankTransfer: 'all', creditCard: 'all' },
            }}
            onSubmit={onSubmit}
            onError={(err) => setError(err.message)}
            onReady={() => console.log('Payment form ready')}
          />
          {validationErrors.length > 0 && (
            <div className="validation-errors">
              {validationErrors.map((error, index) => (
                <div key={index}>{error.message}</div>
              ))}
            </div>
          )}
          {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </div>
      ) : (
        <StatusScreen
          initialization={{ paymentId }}
          onError={(err) => setError(err.message)}
        />
      )}
    </div>
  )
}
