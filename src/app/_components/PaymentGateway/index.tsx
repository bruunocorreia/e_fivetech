import { Payment, StatusScreen, initMercadoPago } from '@mercadopago/sdk-react'
import React, { useEffect, useState } from 'react'

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
    console.log('Iniciando a atualização do estoque...');
    try {
      for (const item of items) {
        const { product, quantity, selectedSize } = item;
  
        if (!selectedSize) {
          throw new Error(`Tamanho não selecionado para o produto ${product.id || product}`);
        }
  
        // Caso o item do produto seja um ID em vez do objeto completo
        const productId = typeof product === 'string' ? product : product.id;
  
        if (!productId) throw new Error(`Produto inválido: ${JSON.stringify(product)}`);
  
        console.log(`Buscando dados do produto ${productId}...`);
  
        // Buscando dados do produto atual para obter o estoque atual
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`);
        const productData = await res.json();
  
        if (!productData?.stock || typeof productData.stock !== 'object') {
          throw new Error(`Estoque inválido ou não encontrado para o produto ${productId}`);
        }
  
        // Acessar o estoque para o tamanho selecionado
        const currentStock = productData.stock[selectedSize];
  
        if (currentStock === undefined || currentStock === null) {
          throw new Error(`Estoque para o tamanho ${selectedSize} não encontrado no produto ${productId}`);
        }
  
        const updatedStock = currentStock - quantity;
  
        if (updatedStock < 0) {
          throw new Error(
            `Estoque insuficiente para o produto ${productId} no tamanho ${selectedSize}. Estoque atual: ${currentStock}, quantidade solicitada: ${quantity}`
          );
        }
  
        console.log(
          `Atualizando estoque do produto ${productId}, tamanho ${selectedSize}: Estoque atual = ${currentStock}, Quantidade = ${quantity}, Estoque atualizado = ${updatedStock}`
        );
  
        // Atualizando o campo `stock` com o novo valor para o tamanho específico
        const updatedStockObject = {
          ...productData.stock,
          [selectedSize]: updatedStock,
        };
  
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/${productId}`, {
          method: 'PATCH',
          body: JSON.stringify({ stock: updatedStockObject }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(
            `Erro ao atualizar o estoque do produto ${productId}, tamanho ${selectedSize}: ${await response.text()}`
          );
        }
  
        console.log(`Estoque atualizado com sucesso para o produto ${productId}, tamanho ${selectedSize}`);
      }
  
      console.log('Atualização do estoque concluída com sucesso.');
    } catch (err) {
      console.error('Erro ao atualizar o estoque:', err.message);
      throw new Error('Erro ao atualizar o estoque dos produtos.');
    }
  };
  
  
  // Função para gerar a nota fiscal e enviar o email com o PDF anexado
  const generateAndSendNotaFiscal = async order => {
    try {
      // Extrair dados necessários do sistema
      const { items } = cart || {}
      const totalValue = cartTotal?.raw

      // Funções auxiliares para formatação
      const formatCpfCnpj = value => (value ? value.replace(/\D/g, '') : '')
      const formatCep = value => (value ? value.replace(/\D/g, '') : '')
      const generateCodigo = () => {
        return Math.floor(10000000 + Math.random() * 90000000).toString()
      }

      // Construir o objeto nfeData com dados dinâmicos
      const nfeData = {
        enviarEmail: true,
        presencial: false,
        codigo: generateCodigo(),
        natureza: 'Venda de Produtos',
        consumidorFinal: true,
        emitente: {
          incentivoFiscal: false,
          incentivadorCultural: false,
          cpfCnpj: process.env.NEXT_PUBLIC_COMPANY_CPF_CNPJ,
          inscricaoEstadual: process.env.NEXT_PUBLIC_COMPANY_IE,
          inscricaoMunicipal: process.env.NEXT_PUBLIC_COMPANY_IM,
          razaoSocial: process.env.NEXT_PUBLIC_COMPANY_RAZAO_SOCIAL,
          simplesNacional: false,
          regimeTributario: 3,
          regimeTributarioEspecial: 0,
          endereco: {
            tipoLogradouro: process.env.NEXT_PUBLIC_COMPANY_TIPO_LOGRADOURO,
            logradouro: process.env.NEXT_PUBLIC_COMPANY_LOGRADOURO,
            numero: process.env.NEXT_PUBLIC_COMPANY_NUMERO,
            complemento: process.env.NEXT_PUBLIC_COMPANY_COMPLEMENTO,
            tipoBairro: process.env.NEXT_PUBLIC_COMPANY_BAIRRO,
            bairro: process.env.NEXT_PUBLIC_COMPANY_BAIRRO,
            codigoCidade: process.env.NEXT_PUBLIC_COMPANY_CODIGO_CIDADE,
            descricaoCidade: process.env.NEXT_PUBLIC_COMPANY_CIDADE,
            estado: process.env.NEXT_PUBLIC_COMPANY_ESTADO,
            cep: process.env.NEXT_PUBLIC_COMPANY_CEP,
            codigoPais: '1058',
            descricaoPais: 'Brasil',
          },
          telefone: {
            ddd: process.env.NEXT_PUBLIC_COMPANY_TELEFONE_DDD,
            numero: process.env.NEXT_PUBLIC_COMPANY_TELEFONE_NUMERO,
          },
          email: process.env.NEXT_PUBLIC_COMPANY_EMAIL,
        },
        destinatario: {
          cpfCnpj: formatCpfCnpj(userData?.socialId || ''),
          razaoSocial: userData?.name,
          nomeFantasia: userData?.name,
          iinscricaoMunicipal: process.env.NEXT_PUBLIC_COMPANY_INSCRICAOMUNICIPAL,
          email: userData?.email,
          endereco: {
            descricaoCidade: shippingData?.city,
            cep: formatCep(zipCode || ''),
            tipoLogradouro: shippingData?.streetType,
            logradouro: shippingData?.address,
            tipoBairro: 'Bairro',
            codigoCidade: shippingData?.cityCode || 4115200,
            complemento: shippingData?.complement,
            estado: shippingData?.state,
            numero: shippingData?.houseNumber,
            bairro: shippingData?.neighborhood,
          },
          telefone: {
            ddd: userData?.phoneNumber ? userData?.phoneNumber.replace(/\D/g, '').slice(0, 2) : '',
            numero: userData?.phoneNumber ? userData?.phoneNumber.replace(/\D/g, '').slice(2) : '',
          },
        },
        itens: items?.map((item, index) => {
          const product = item.product
          const quantity = item.quantity || 1
          const unitPrice = parseFloat(product.price)
          const totalPrice = unitPrice * quantity

          return {
            codigo: product.id?.toString() || `00${index + 1}`,
            ncm: product.ncm || '11081200', // Utilize o NCM real do produto
            cest: product.cest || '0123456', // Utilize o CEST real do produto
            cfop: '5102',
            unidade: {
              comercial: 'UN',
              tributavel: 'UN',
            },
            quantidadeComercial: quantity,
            quantidadeTributavel: quantity,
            valorUnitario: {
              comercial: unitPrice,
              tributavel: unitPrice,
            },
            valor: totalPrice,
            descricao: product.name || 'Produto',
            compoeTotal: true,
            tributos: {
              icms: {
                origem: '0',
                cst: '00',
                baseCalculo: {
                  modalidadeDeterminacao: '0',
                  valor: totalPrice,
                },
                aliquota: 12,
                valor: totalPrice * 0.12,
              },
              pis: {
                cst: '01',
                baseCalculo: {
                  valor: totalPrice,
                },
                aliquota: 1.65,
                valor: totalPrice * 0.0165,
              },
              cofins: {
                cst: '01',
                baseCalculo: {
                  valor: totalPrice,
                },
                aliquota: 7.6,
                valor: totalPrice * 0.076,
              },
            },
          }
        }),
        total: {
          baseCalculoIcms: totalValue,
          valorIcms: totalValue * 0.12,
          valorProdutosServicos: totalValue,
          valorCofins: totalValue * 0.076,
          valorPis: totalValue * 0.0165,
          valorNfe: totalValue,
        },
        pagamentos: [
          {
            aVista: true,
            meio: '01', // Código para pagamento em dinheiro
            valor: totalValue,
          },
        ],
        responsavelTecnico: {
          cpfCnpj: process.env.NEXT_PUBLIC_RESP_TEC_CPF_CNPJ,
          nome: process.env.NEXT_PUBLIC_RESP_TEC_NOME,
          email: process.env.NEXT_PUBLIC_RESP_TEC_EMAIL,
          telefone: {
            ddd: process.env.NEXT_PUBLIC_RESP_TEC_TELEFONE_DDD,
            numero: process.env.NEXT_PUBLIC_RESP_TEC_TELEFONE_NUMERO,
          },
        },
      }

      // Passo 1: Criar NF-e
      const createResponse = await axios.post('/api/enviar-nfe', nfeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const nfeResponse = createResponse.data

      if (nfeResponse.documents && nfeResponse.documents[0]) {
        const nfeId = nfeResponse.documents[0].id

        // Passo 2: Baixar o PDF da NF-e usando o nfeId
        const pdfResponse = await axios.get(`/api/nfe/${nfeId}/pdf`, {
          responseType: 'arraybuffer',
        })

        // Converter o PDF em base64
        const pdfBuffer = Buffer.from(pdfResponse.data)
        const attachment = {
          filename: 'nota_fiscal.pdf',
          content: pdfBuffer.toString('base64'),
          encoding: 'base64',
          contentType: 'application/pdf',
        }

        // Passo 3: Enviar e-mail com o PDF anexado
        sendNotaFiscalEmail(userData.email, userData.name, attachment)

        console.log('Nota Fiscal enviada com sucesso!')
      } else {
        setError('Resposta inesperada do servidor. ID da NF-e não encontrado.')
        console.error('Estrutura de resposta inesperada:', nfeResponse)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Erro ao enviar NF-e:', JSON.stringify(err.response.data, null, 2))
        if (err.response.data.data && err.response.data.data.fields) {
          console.error(
            'Detalhes dos campos com erro:',
            JSON.stringify(err.response.data.data.fields, null, 2),
          )
        }
      } else {
        console.error('Erro ao enviar NF-e:', err)
      }
      setError('Falha ao gerar ou enviar a Nota Fiscal.')
    }
  }

  const proceedWithOrder = async (paymentResponse) => {
    try {
      console.log('Iniciando o fluxo de processamento do pedido...')

      // Realiza a criação do pedido
      const shippingTicketUrl = await completeFreightPurchase()

      console.log('Criando pedido...')
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

      // Adicione validações antes de chamar a API
      if (!cart?.items?.length) {
        throw new Error('O carrinho está vazio.')
      }
      if (!userData?.email || !userData?.socialId) {
        throw new Error('Informações do usuário estão incompletas (email ou CPF/CNPJ ausentes).')
      }
      if (!shippingData?.city || !zipCode) {
        throw new Error('Informações de envio estão incompletas (cidade ou CEP ausentes).')
      }

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
      
      // Gera email de agradecimento pela compra
      console.log('Gerando email de agradecimento pela compra...')
      sendEmail(userData.email, userData.name)

      // Atualiza o estoque
      console.log('Atualizando o estoque dos produtos...')
      await updateProductStock(cart.items)

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
    
    try {
      const addToCartResponse = await axios.post('/api/add-to-cart', {
        service: serviceId,
        agency: '',
        from: {
          postal_code: process.env.NEXT_PUBLIC_COMPANY_CEP,
          name: process.env.NEXT_PUBLIC_COMPANY_RAZAO_SOCIAL,
          address: process.env.NEXT_PUBLIC_COMPANY_LOGRADOURO,
          city: process.env.NEXT_PUBLIC_COMPANY_CIDADE,
          document: process.env.NEXT_PUBLIC_COMPANY_CPF || '32948910080',
        },
        to: {
          postal_code: zipCode,
          name: userData?.name || 'Nome do Destinatário',
          address: shippingData?.city,
          city: shippingData?.city,
          document: userData?.socialId || '',
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

        await axios.post('/api/purchase-labels', {
          orderIds: localOrderIds,
        })
        await axios.post('/api/generate-labels', {
          orderIds: localOrderIds,
        })
        const printableResponse = await axios.post('/api/print-labels', {
          mode: 'public',
          orders: localOrderIds,
        })

        if (printableResponse.data && printableResponse.data.url) {
          return printableResponse.data.url
        } else {
          throw new Error('Nenhuma URL retornada da API')
        }
      } else {
        throw new Error('Falha ao recuperar o ID do pedido da resposta.')
      }
    } catch (err) {
      console.error('Erro durante o processo de compra de frete:', err)
      setError(`Falha durante o processo de compra de frete: ${err.message || err}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('userData recebido no PaymentGateway:', userData)
  }, [userData])

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
    const errors = validateCartItems(cart?.items || [])
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      console.log('Iniciando o fluxo de pagamento...')
      console.log('Dados do formulário (formData):', formData)
      console.log('Dados do usuário (userData):', userData)
      // Atualiza o estoque
      console.log('Atualizando o estoque dos produtos...')
      // comentado foi apenas para teste enquanto mercado livre fora do ar await updateProductStock(cart.items)
      const paymentData = {
        ...formData,
        description: transactionDescription,
        transaction_amount: parseFloat(amount.toFixed(2))
      }

      console.log('Dados de pagamento (paymentData) a serem enviados para o backend:', paymentData)

      const response = await axios.post('/api/process-payment', { paymentData })
      const paymentResponse = response.data

      if (paymentResponse && paymentResponse.id) {
        setPaymentId(paymentResponse.id)
        console.log('Pagamento processado:', paymentResponse)
      } else {
        console.log('Falha no processamento do pagamento. Resposta recebida:', paymentResponse)
        setError('Erro no processamento do pagamento.')
        throw new Error('Falha no processamento do pagamento')
      }

      if (paymentResponse.status === 'approved') {
        // Pagamento aprovado, prossegue com o fluxo
        await proceedWithOrder(paymentResponse)
      } else if (paymentResponse.payment_method_id === 'pix') {
        // Se for PIX, exibe a mensagem informando que tem 2 minutos para concluir o pagamento
        setShowPixMessage(true)
        setTimeout(async () => {
          try {
            const statusResponse = await axios.get('/api/payment-status', {
              params: { payment_id: paymentResponse.id },
            })
            const updatedPayment = statusResponse.data

            if (updatedPayment.status === 'approved') {
              // Pagamento aprovado após 2 minutos
              await proceedWithOrder(updatedPayment)
            } else {
              const errorMessage = 'Pagamento não aprovado. Por favor, tente novamente.'
              console.log(updatedPayment.status)
              setError(errorMessage)
              router.push(`/order-confirmation?error=${encodeURIComponent(errorMessage)}`)
            }
          } catch (err) {
            console.error('Erro ao verificar o status do pagamento:', err)
            setError('Erro ao verificar o status do pagamento.')
          }
        }, 120000) // 120000 milissegundos = 2 minutos
      } else {
        setError('Pagamento não aprovado. Por favor, tente novamente.')
        router.push(`/order-confirmation?error=${encodeURIComponent('Pagamento não aprovado.')}`)
      }
    } catch (err) {
      console.error('Erro durante o processo de pagamento:', err)
      setError(`Falha durante o processo de pagamento: ${err.message}`)
    }
  }

  if (!userData || !userData.email) {
    return <div>Carregando dados do usuário...</div>
  }

  return (
    <div>
      {!paymentId ? (
        <div>
          <Payment
            initialization={initialization}
            customization={customization}
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

export default PaymentGateway
