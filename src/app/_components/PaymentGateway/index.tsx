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

  const transactionDescription = 'Minimo1'

  const validateCartItems = items => {
    const errors = []
    items.forEach((item, index) => {
      if (!item.selectedSize) {
        errors.push({ field: `items.${index}.selectedSize`, message: 'This field is required.' })
      }
      if (!item.selectedColor) {
        errors.push({ field: `items.${index}.selectedColor`, message: 'This field is required.' })
      }
    })
    return errors
  }

// NF-e data as provided
const nfeData = {
  enviarEmail: true,
  presencial: false,
  codigo: 1234567,
  natureza: 'Venda de Produto Teste',
  consumidorFinal: true,
  emitente: {
    incentivoFiscal: false,
    incentivadorCultural: false,
    cpfCnpj: '08187168000160',
    inscricaoEstadual: '9044016688',
    inscricaoMunicipal: '096650',
    razaoSocial: 'TESTE TECNOSPEED S/A',
    simplesNacional: false,
    regimeTributario: 3,
    regimeTributarioEspecial: 0,
    endereco: {
      tipoLogradouro: 'AVENIDA',
      logradouro: 'AVENIDA DUQUE DE CAXIAS',
      numero: '882',
      complemento: 'Torre II - 17 andar',
      tipoBairro: 'ZONA',
      bairro: 'ZONA',
      codigoCidade: '4115200',
      descricaoCidade: 'MARINGAPR',
      estado: 'PR',
      cep: '87020025',
      codigoPais: '1058',
      descricaoPais: 'Brasil',
    },
    telefone: {
      ddd: '44',
      numero: '44444444',
    },
    email: 'email.teste@tecnospeed.com.br',
  },
  destinatario: {
    cpfCnpj: '00000000000191',
    razaoSocial: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
    nomeFantasia: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
    inscricaoMunicipal: '8214100099',
    email: 'email.teste@tecnospeed.com.br',
    endereco: {
      descricaoCidade: 'Maringa',
      cep: '87020100',
      tipoLogradouro: 'Rua',
      logradouro: 'Barao do rio branco',
      tipoBairro: 'Centro',
      codigoCidade: '4115200',
      complemento: 'sala 02',
      estado: 'PR',
      numero: '1001',
      bairro: 'Centro',
    },
    telefone: {
      ddd: '44',
      numero: '99999999',
    },
  },
  itens: [
    {
      codigo: '001',
      ncm: '11081200',
      cest: '0123456',
      cfop: '5102',
      unidade: {
        comercial: 'CX',
        tributavel: 'CX',
      },
      valorUnitario: {
        comercial: 0.01,
        tributavel: 0.01,
      },
      valor: 0.01,
      descricao: 'PRODUTO TESTE PLUGNOTAS',
      compoeTotal: true,
      tributos: {
        icms: {
          origem: '0',
          cst: '00',
          baseCalculo: {
            modalidadeDeterminacao: '0',
            valor: 0.01,
          },
          aliquota: 12,
          valor: 0.01,
        },
        pis: {
          cst: '01',
          baseCalculo: {
            valor: 0.01,
          },
          aliquota: 1.65,
          valor: 0.01,
        },
        cofins: {
          cst: '01',
          baseCalculo: {
            valor: 0.01,
          },
          aliquota: 7.6,
          valor: 0.01,
        },
      },
    },
  ],
  total: {
    baseCalculoIcms: 0.01,
    valorIcms: 0.01,
    valorProdutosServicos: 0.01,
    valorCofins: 0.01,
    valorPis: 0.01,
    valorNfe: 0.01,
  },
  pagamentos: [
    {
      aVista: true,
      meio: '01',
      valor: 0.01,
    },
  ],
  responsavelTecnico: {
    cpfCnpj: '99999999999999',
    nome: 'Desenvolvedor Responsável',
    email: 'email.teste@tecnospeed.com.br',
    telefone: {
      ddd: '44',
      numero: '99999999',
    },
  },
}

  // Função para gerar a nota fiscal e enviar o email com o PDF anexado
  // In your PaymentGateway component
const generateAndSendNotaFiscal = async () => {
  try {
    // Step 1: Create NF-e
    const createResponse = await axios.post('/api/enviar-nfe', nfeData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const nfeResponse = createResponse.data;

    if (nfeResponse.documents && nfeResponse.documents[0]) {
      const nfeId = nfeResponse.documents[0].id;

      // Step 2: Download the NF-e PDF using the nfeId
      const pdfResponse = await axios.get(`/api/nfe/${nfeId}/pdf`, {
        responseType: 'stream', // Important to receive binary data
      });

      // Collect the stream data into a Buffer
      const chunks = [];
      pdfResponse.data.on('data', (chunk) => chunks.push(chunk));
      await new Promise((resolve, reject) => {
        pdfResponse.data.on('end', resolve);
        pdfResponse.data.on('error', reject);
      });

      const pdfBuffer = Buffer.concat(chunks);

      // Optional: Write the buffer to a file to check if it's valid
      fs.writeFileSync('test.pdf', pdfBuffer);
      console.log('PDF file saved as test.pdf');

      // Log the types and contents
      console.log('Type of pdfResponse.data:', typeof pdfResponse.data);
      console.log('Is pdfBuffer an instance of Buffer?', pdfBuffer instanceof Buffer);


      // Step 3: Send email with PDF attached
      sendNotaFiscalEmail(userData.email, userData.name,pdfBuffer)

      console.log('Nota Fiscal enviada com sucesso!');
    } else {
      setError('Resposta inesperada do servidor. ID da NF-e não encontrado.');
      console.error('Estrutura de resposta inesperada:', nfeResponse);
    }
  } catch (err) {
    console.error('Erro ao gerar ou enviar a Nota Fiscal:', err);
    setError('Falha ao gerar ou enviar a Nota Fiscal.');
  }
};

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

  const completeFreightPurchase = async () => {
    setLoading(true)
    setError('')

    try {
      const addToCartResponse = await axios.post('/api/add-to-cart', {
        service: serviceId,
        agency: '',
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

      if (addToCartResponse.data && addToCartResponse.data.id) {
        const localOrderIds = [addToCartResponse.data.id]
        setOrderIds(localOrderIds)

        const checkoutResponse = await axios.post('/api/purchase-labels', {
          orderIds: localOrderIds,
        })
        const generateLabelResponse = await axios.post('/api/generate-labels', {
          orderIds: localOrderIds,
        })
        const printableResponse = await axios.post('/api/print-labels', {
          mode: 'public',
          orders: localOrderIds,
        })

        if (printableResponse.data && printableResponse.data.url) {
          return printableResponse.data.url
        } else {
          throw new Error('No URL returned from the API')
        }
      } else {
        throw new Error('Failed to retrieve order ID from the response.')
      }
    } catch (err) {
      console.error('Erro durante o processo de compra de frete:', err)
      setError(`Falha durante o processo de compra de frete: ${err.message || err}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  const initialization = {
    amount: amount,
  }

  const customization = {
    paymentMethods: {
      bankTransfer: 'all',
      creditCard: 'all',
    },
  }

  const onSubmit = async ({ formData }) => {
    const paymentData = {
      ...formData,
      description: transactionDescription, // Inclui a descrição do produto, além do formulário
      transaction_amount: parseFloat(amount.toFixed(2)),
    }
    // Callback chamado ao clicar no botão de submissão dos dados
    const response = await axios.post('/api/process-payment', { paymentData })
    if (response.data && response.data.id) {
      setPaymentId(response.data.id)
      console.log('Payment processed', response)
    }

    const errors = validateCartItems(cart?.items || [])
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

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

      // Gera a Nota Fiscal e envia o e-mail com o PDF após a confirmação do pedido
      await generateAndSendNotaFiscal()

      router.push(`/order-confirmation?order_id=${order.id}`)
    } catch (err) {
      console.error(err.message)
      router.push(`/order-confirmation?error=${encodeURIComponent(err.message)}`)
    }
  }

  const onError = error => {
    console.error('Error processing payment', error)
  }

  const onReady = () => {
    console.log('Payment form ready')
  }

  return (
    <div>
      {!paymentId ? (
        <div>
          <Payment
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onError={onError}
            onReady={onReady}
          />
          {validationErrors.length > 0 && (
            <div className="validation-errors">
              {validationErrors.map((error, index) => (
                <div key={index}>{error.message}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <StatusScreen
          initialization={{ paymentId: paymentId }}
          onError={error => console.error(error)}
        />
      )}
    </div>
  )
}
