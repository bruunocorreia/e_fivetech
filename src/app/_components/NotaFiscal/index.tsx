'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

export const NFeCreator = ({ onNFeCreation }) => {
  const [nfeInfo, setNfeInfo] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const createNFe = async () => {
      setError('')
      setNfeInfo(null)

      // Dados fornecidos no código 3 (cURL do Postman)
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

      // Log dos dados que serão enviados
      console.log('Enviando dados para criar NF-e:', nfeData)

      try {
        const response = await axios.post('/api/enviar-nfe', nfeData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        // Log da resposta recebida
        console.log('Resposta recebida do backend:', response.data)

        const nfeResponse = response.data

        setSuccess('NF-e criada com sucesso!')
        setNfeInfo(nfeResponse)
        if (onNFeCreation) {
          onNFeCreation(nfeResponse)
        }
      } catch (err) {
        // Log detalhado do erro
        if (err.response) {
          console.error('Erro na resposta do backend:', err.response.data)
        } else if (err.request) {
          console.error('Nenhuma resposta recebida do backend:', err.request)
        } else {
          console.error('Erro ao configurar a requisição:', err.message)
        }
        setError('Falha ao criar a NF-e. Verifique os dados e tente novamente.')
        if (onNFeCreation) {
          onNFeCreation(null)
        }
      }
    }

    // Chama a função para criar a NF-e quando o componente for montado
    createNFe()
  }, []) // Remova 'onNFeCreation' das dependências se não for necessário

  return (
    <div className="nfe-container">
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {nfeInfo && (
        <div className="nfe-result">
          <h4>NF-e Criada com Sucesso!</h4>
          <p>
            <strong>ID da NF-e:</strong> {nfeInfo[0]?.id}
          </p>
          <p>
            <strong>Status:</strong> {nfeInfo[0]?.status}
          </p>
          {/* Outros detalhes da NF-e conforme a resposta da API */}
        </div>
      )}
    </div>
  )
}

export default NFeCreator
