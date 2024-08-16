import axios from 'axios'
import { Router } from 'express'

const router = Router()

router.post('/enviar-nfe', async (req, res) => {
  const ref = '12345' // Atribuição correta da variável ref
  const token = process.env.NOTA_FISCAL // Atribuição correta do token

  try {
    const response = await axios.post(
      `https://homologacao.focusnfe.com.br/v2/nfe?ref=${ref}`,
      {
        natureza_operacao: 'Remessa',
        data_emissao: '2018-03-21T11:00:00',
        data_entrada_saida: '2018-03-21T11:00:00',
        tipo_documento: '1',
        finalidade_emissao: '1',
        cnpj_emitente: '51916585000125',
        nome_emitente: 'ACME LTDA',
        nome_fantasia_emitente: 'ACME LTDA',
        logradouro_emitente: 'R. Padre Natal Pigato',
        numero_emitente: '100',
        bairro_emitente: 'Santa Felicidade',
        municipio_emitente: 'Curitiba',
        uf_emitente: 'PR',
        cep_emitente: '82320030',
        inscricao_estadual_emitente: '1234567',
        nome_destinatario: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
        cpf_destinatario: '51966818092',
        telefone_destinatario: '1196185555',
        logradouro_destinatario: 'Rua São Januário',
        numero_destinatario: '99',
        bairro_destinatario: 'Crespo',
        municipio_destinatario: 'Manaus',
        uf_destinatario: 'AM',
        pais_destinatario: 'Brasil',
        cep_destinatario: '69073178',
        valor_frete: '0.0',
        valor_seguro: '0',
        valor_total: '47.23',
        valor_produtos: '47.23',
        modalidade_frete: '0',
        items: [
          {
            numero_item: '1',
            codigo_produto: '1232',
            descricao: 'Cartões de Visita',
            cfop: '6923',
            unidade_comercial: 'un',
            quantidade_comercial: '100',
            valor_unitario_comercial: '0.4723',
            valor_unitario_tributavel: '0.4723',
            unidade_tributavel: 'un',
            codigo_ncm: '49111090',
            quantidade_tributavel: '100',
            valor_bruto: '47.23',
            icms_situacao_tributaria: '400',
            icms_origem: '0',
            pis_situacao_tributaria: '07',
            cofins_situacao_tributaria: '07',
          },
        ],
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )
    res.json(response.data)
  } catch (error) {
    console.error('Erro ao enviar NFe:', error)
    res.status(500).send('Falha ao enviar NFe. Por favor, tente novamente.')
  }
})

export default router
