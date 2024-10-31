import { Payment, StatusScreen, initMercadoPago } from '@mercadopago/sdk-react';
import React, { useState } from 'react';

import axios from 'axios';
import { useAuth } from '../../_providers/Auth';
import { useCart } from '../../_providers/Cart';
import { useEmailSender } from '../../_components/email';
import { useRouter } from 'next/navigation';

initMercadoPago('TEST-e4e31358-531f-4c4d-bd5c-3e77edc4ee3f', { locale: 'pt-BR' });

export const PaymentGateway = ({ amount, serviceId, shippingData, userData, zipCode }) => {
  const router = useRouter();
  const [orderIds, setOrderIds] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const { sendEmail, sendNotaFiscalEmail } = useEmailSender();
  const { user } = useAuth();
  const { cart, cartTotal } = useCart();

  const transactionDescription = 'Minimo1';

  const validateCartItems = (items) => {
    const errors = [];
    items.forEach((item, index) => {
      if (!item.selectedSize) {
        errors.push({ field: `items.${index}.selectedSize`, message: 'This field is required.' });
      }
      if (!item.selectedColor) {
        errors.push({ field: `items.${index}.selectedColor`, message: 'This field is required.' });
      }
    });
    return errors;
  };

  // Função para gerar a nota fiscal e enviar o email com o PDF anexado
  const generateAndSendNotaFiscal = async (order) => {
    try {
      // Extrair dados necessários do sistema
      const { items } = cart || {};
      const totalValue = cartTotal?.raw;
  
      // Funções auxiliares para formatação
      const formatCpfCnpj = (value) => value ? value.replace(/\D/g, '') : '';
      const formatCep = (value) => value ? value.replace(/\D/g, '') : '';
      const generateCodigo = () => {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
      };
  
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
            ddd: process.env.NEXT_PUBLIC_COMPANY_TELEFONE_DDD ,
            numero: process.env.NEXT_PUBLIC_COMPANY_TELEFONE_NUMERO,
          },
          email: process.env.NEXT_PUBLIC_COMPANY_EMAIL,
        },
        destinatario: {
          cpfCnpj: formatCpfCnpj(userData.socialId || ''),
          razaoSocial: userData.name,
          nomeFantasia: userData.name,
          iinscricaoMunicipal: '8214100099',
          email: userData.email,
          endereco: {
            descricaoCidade: shippingData.city,
            cep: formatCep(zipCode || ''),
            tipoLogradouro: shippingData.streetType,
            logradouro: shippingData.address,
            tipoBairro: 'Bairro',
            codigoCidade: shippingData.cityCode || 4115200,
            complemento: shippingData.complement,
            estado: shippingData.state,
            numero: shippingData.houseNumber,
            bairro: shippingData.neighborhood,
          },
          telefone: {
            ddd: userData.phoneNumber ? userData.phoneNumber.replace(/\D/g, '').slice(0, 2) : '',
            numero: userData.phoneNumber ? userData.phoneNumber.replace(/\D/g, '').slice(2) : '',
          },
        },
        itens: items?.map((item, index) => {
          const product = item.product;
          const quantity = item.quantity || 1;
          const unitPrice = parseFloat(product.price);
          const totalPrice = unitPrice * quantity;
  
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
          };
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
      };
  
      // Passo 1: Criar NF-e
      const createResponse = await axios.post('/api/enviar-nfe', nfeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const nfeResponse = createResponse.data;
  
      if (nfeResponse.documents && nfeResponse.documents[0]) {
        const nfeId = nfeResponse.documents[0].id;
  
        // Passo 2: Baixar o PDF da NF-e usando o nfeId
        const pdfResponse = await axios.get(`/api/nfe/${nfeId}/pdf`, {
          responseType: 'arraybuffer',
        });
  
        // Converter o PDF em base64
        const pdfBuffer = Buffer.from(pdfResponse.data);
        const attachment = {
          filename: 'nota_fiscal.pdf',
          content: pdfBuffer.toString('base64'),
          encoding: 'base64',
          contentType: 'application/pdf',
        };
  
        // Passo 3: Enviar e-mail com o PDF anexado
        sendNotaFiscalEmail(userData.email, userData.name, attachment);
  
        console.log('Nota Fiscal enviada com sucesso!');
      } else {
        setError('Resposta inesperada do servidor. ID da NF-e não encontrado.');
        console.error('Estrutura de resposta inesperada:', nfeResponse);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Erro ao enviar NF-e:', JSON.stringify(err.response.data, null, 2));
        if (err.response.data.data && err.response.data.data.fields) {
          console.error('Detalhes dos campos com erro:', JSON.stringify(err.response.data.data.fields, null, 2));
        }
      } else {
        console.error('Erro ao enviar NF-e:', err);
      }
      setError('Falha ao gerar ou enviar a Nota Fiscal.');
    }
  };
  
  // Restante do código permanece o mesmo

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
  };

  const customization = {
    paymentMethods: {
      bankTransfer: 'all',
      creditCard: 'all',
    },
  };

  const onSubmit = async ({ formData }) => {
    const paymentData = {
      ...formData,
      description: transactionDescription,
      transaction_amount: parseFloat(amount.toFixed(2)),
    };

    const response = await axios.post('/api/process-payment', { paymentData });
    if (response.data && response.data.id) {
      setPaymentId(response.data.id);
      console.log('Payment processed', response);
    }

    const errors = validateCartItems(cart?.items || []);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const shippingTicketUrl = await completeFreightPurchase();

      const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total: cartTotal.raw,
          items: (cart?.items || [])?.map(
            ({ product, quantity, selectedColor, selectedSize }) => ({
              product: typeof product === 'string' ? product : product.id,
              quantity,
              selectedSize,
              selectedColor,
              price: typeof product === 'object' ? product.price : undefined,
            })
          ),
          shippingTicket: shippingTicketUrl,
          shippingZipCode: zipCode,
          shippingHouseNumber: shippingData.houseNumber,
          shippingComplement: shippingData.complement,
          userName: userData.name,
          userMail: userData.email,
          userSocialId: userData.socialId,
          userPhoneNumber: userData.phoneNumber,
        }),
      });

      if (!orderReq.ok) throw new Error(orderReq.statusText || 'Something went wrong.');

      const order = await orderReq.json();
      sendEmail(userData.email, userData.name);

      // Gera a Nota Fiscal e envia o e-mail com o PDF após a confirmação do pedido
      await generateAndSendNotaFiscal(order);

      router.push(`/order-confirmation?order_id=${order.id}`);
    } catch (err) {
      console.error(err.message);
      router.push(`/order-confirmation?error=${encodeURIComponent(err.message)}`);
    }
  };

  const onError = (error) => {
    console.error('Error processing payment', error);
  };

  const onReady = () => {
    console.log('Payment form ready');
  };

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
          onError={(error) => console.error(error)}
        />
      )}
    </div>
  );
};
