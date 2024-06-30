import { Payment, StatusScreen, initMercadoPago } from '@mercadopago/sdk-react'
import React, { useState } from 'react'

import { Order } from '../../../payload/payload-types'
import axios from 'axios'
import { useAuth } from '../../_providers/Auth'
import { useCart } from '../../_providers/Cart'
import { useEmailSender } from '../../_components/email'
import { useRouter } from 'next/navigation'

initMercadoPago('TEST-e4e31358-531f-4c4d-bd5c-3e77edc4ee3f', { locale: 'pt-BR' })

export const PaymentGateway = ({ amount, serviceId, shippingData, userData, zipCode }) => {
  const router = useRouter()
  const [orderIds, setOrderIds] = useState<string[]>([]) // Initialize orderIds state
  const [error, setError] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const { sendEmail } = useEmailSender()
  const { user } = useAuth()

  const [paymentId, setPaymentId] = useState<string | null>(null)
  const transactionDescription = 'Minimo1'
  const { cart, cartTotal } = useCart()

  const completeFreightPurchase = async () => {
    setLoading(true)
    setError('')

    try {
      // Step 2: insere frete no carrinho
      const addToCartResponse = await axios.post('/api/add-to-cart', {
        service: serviceId,
        agency: '', // Replace with your agency ID (if applicable)
        from: {
          postal_code: '96020360',
          name: 'cliente_name2',
          address: 'cliente_address',
          city: 'cliente_city',
          document: '18548537086',
        },
        to: {
          postal_code: '09121929',
          name: 'Ale',
          address: '456 Elm Street',
          city: 'Big City',
          document: '44810439895',
        },
        products: [
          {
            name: 'T-Shirt',
          },
        ],
        volumes: [
          {
            height: 10,
            width: 10,
            length: 10,
            weight: 1,
          },
        ],
        options: {},
      })

      let localOrderIds
      if (addToCartResponse.data && addToCartResponse.data.id) {
        localOrderIds = [addToCartResponse.data.id] // Armazena localmente
        setOrderIds(localOrderIds) // Atualiza o estado
      } else {
        console.error('No valid ID returned from the API')
        setError('Failed to retrieve order ID from the response.')
        return null
      }

      // Step 4: checkout
      await axios.post('/api/purchase-labels', { orderIds: localOrderIds })

      // Step 5: Gera a etiqueta
      await axios.post('/api/generate-labels', {
        orderIds: localOrderIds,
      })

      // Step 6: Gera a etiqueta
      const printabelResponse = await axios.post('/api/print-labels', {
        mode: 'public',
        orders: localOrderIds,
      })

      if (printabelResponse.data && printabelResponse.data.url) {
        return printabelResponse.data.url // Retorna a URL da etiqueta de envio
      } else {
        throw new Error('No URL returned from the API')
      }
    } catch (err: any) {
      console.error('Erro durante o processo de compra de frete:', err)
      setError(`Falha durante o processo de compra de frete: ${err.message || err}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  const initialization = {
    amount: amount,
    preferenceId: '<PREFERENCE_ID>',
  }

  const customization = {
    paymentMethods: {
      bankTransfer: 'all',
      creditCard: 'all',
    },
  }

  const onSubmit = async ({ formData }: { formData: any }) => {
    try {
      const shippingTicketUrl = await completeFreightPurchase()

      const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total: cartTotal.raw,
          items: (cart?.items || [])?.map(({ product, quantity, selectedColor, selectedSize }) => ({
            product: typeof product === 'string' ? product : product.id,
            quantity,
            selectedSize,
            selectedColor,
            price: typeof product === 'object' ? product.price : undefined,
          })),
          shippingTicket: shippingTicketUrl,
          shippingZipCode: zipCode,
          shippingHouseNumber: shippingData.houseNumber,
          shippingComplement: shippingData.complement,
          userName: userData.name,
          userMail: userData.email,
          userSocialId: userData.socialId,
          userPhoneNumber: userData.phoneNumber,
        }),
      })

      if (!orderReq.ok) throw new Error(orderReq.statusText || 'Something went wrong.')

      const order = await orderReq.json()
      sendEmail(userData.email, userData.name)

      router.push(`/order-confirmation?order_id=${order.id}`)
    } catch (err: any) {
      console.error(err.message) // eslint-disable-line no-console
      router.push(`/order-confirmation?error=${encodeURIComponent(err.message)}`)
    }
  }

  const onError = (error: any) => {
    console.error('Error processing payment', error)
  }

  const onReady = () => {
    console.log('Payment form ready')
  }

  // Renderiza o componente StatusScreen se paymentId estiver definido, caso contrário renderiza Payment
  return (
    <div>
      {!paymentId ? (
        <Payment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onError={onError}
          onReady={onReady}
        />
      ) : (
        <StatusScreen
          initialization={{ paymentId: paymentId }}
          onError={error => console.error(error)}
        />
      )}
    </div>
  )
}
