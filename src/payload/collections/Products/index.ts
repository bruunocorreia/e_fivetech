// src/collections/Products/index.ts

import type { CollectionConfig } from 'payload/types'
import { ConditionalText } from '../../fields/conditionalText'
import { admins } from '../../access/admins'
import { revalidateProduct } from './hooks/revalidateProduct'
import { slugField } from '../../fields/slug'
import CurrencyField from '../../fields/CurrencyField';

const Products: CollectionConfig = {
  slug: 'products',
  labels: { plural: 'Produtos', singular: 'Produto' },
  admin: {
    useAsTitle: 'title',
    preview: (doc) => {
      return `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/preview?url=${encodeURIComponent(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/products/${doc.slug}`,
      )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`
    },
    // Exibe cada tamanho do estoque em sua própria coluna na table list
    defaultColumns: [
      'title',
      'price',
      'discountPercentage',
      'stockPP',
      'stockP',
      'stockM',
      'stockG',
      'stockGG',
      '_status'
    ],
  },
  hooks: {
    afterChange: [revalidateProduct],
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (data.sale && data.price && data.discountPercentage) {
          data.newprice = data.price - (data.price * data.discountPercentage) / 100
        } else if (!data.sale) {
          data.newprice = null
        } else {
          data.newprice = originalDoc?.newprice || null
        }
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        // Cálculo do newprice
        if (data.sale && data.price && data.discountPercentage) {
          data.newprice = data.price - (data.price * data.discountPercentage) / 100
        } else if (!data.sale) {
          data.newprice = 1
        } else {
          data.newprice = originalDoc?.newprice || null
        }

        // Atualiza o array "sizes" com base nos valores de estoque de cada tamanho
        const sizesMapping = {
          PP: data.stockPP,
          P: data.stockP,
          M: data.stockM,
          G: data.stockG,
          GG: data.stockGG,
        }

        if (sizesMapping && Array.isArray(data.sizes)) {
          data.sizes = data.sizes.filter(size => {
            const stockValue = sizesMapping[size]
            return stockValue && stockValue > 0
          })

          const allSizes = ['PP', 'P', 'M', 'G', 'GG']
          allSizes.forEach(size => {
            const stockValue = sizesMapping[size]
            if (stockValue && stockValue > 0 && !data.sizes.includes(size)) {
              data.sizes.push(size)
            }
          })
        }
      },
    ],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: admins,
    update: () => true,
    delete: admins,
  },
  fields: [
    {
      name: 'title',
      label: 'Nome do Produto',
      type: 'text',
      required: true,
    },
    {
      name: 'productId',
      label: 'ID do Produto',
      type: 'text',
      required: true,
    },
    {
      name: 'new',
      label: 'New In',
      type: 'checkbox',
    },
    {
      name: 'sale',
      label: 'Sale',
      type: 'checkbox',
    },
    {
      name: 'hot',
      label: 'Em Alta',
      type: 'checkbox',
    },
    {
      name: 'categories',
      label: 'Categorias',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'colors',
      label: 'Cores disponíveis',
      type: 'relationship',
      relationTo: 'colors',
      hasMany: true,
    },
    {
      name: 'sizes',
      label: 'Tamanhos disponíveis',
      type: 'select',
      options: [
        { value: 'GG', label: 'GG' },
        { value: 'G', label: 'G' },
        { value: 'M', label: 'M' },
        { value: 'P', label: 'P' },
        { value: 'PP', label: 'PP' },
      ],
      hasMany: true,
      admin: { hidden: true },
      defaultValue: ['GG', 'G', 'M', 'P', 'PP'], // Seleciona todos os valores por padrão
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      required: true,
      admin: {
        rows: 4,
      },
    },
    {
      name: 'composition',
      label: 'Composição',
      type: 'textarea',
      required: true,
      admin: {
        rows: 4,
      },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Preço',
      required: true,
      admin: {
        step: 20.0,
        components: {
          Field: CurrencyField,
        },
      },
    },
    {
      name: 'discountPercentage',
      label: 'Percentual de Desconto',
      type: 'number',
      admin: {
        step: 1.0,
        condition: (_, siblingData) => siblingData?.sale === true,
      },
      required: true,
    },
    {
      name: 'newprice',
      label: 'Preço após desconto',
      type: 'ui',
      admin: {
        condition: (_, siblingData) => siblingData?.sale === true,
        components: {
          Field: ConditionalText,
        },
      },
    },
    // Os campos de estoque agora são individuais, em vez de um group
    {
      name: 'stockPP',
      label: 'Estoque PP',
      type: 'number',
      required: false,
      admin: {
        step: 1,
      },
      defaultValue: 0,
      validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
    },
    {
      name: 'stockP',
      label: 'Estoque P',
      type: 'number',
      required: false,
      admin: {
        step: 1,
      },
      defaultValue: 0,
      validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
    },
    {
      name: 'stockM',
      label: 'Estoque M',
      type: 'number',
      required: false,
      admin: {
        step: 1,
      },
      defaultValue: 0,
      validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
    },
    {
      name: 'stockG',
      label: 'Estoque G',
      type: 'number',
      required: false,
      admin: {
        step: 1,
      },
      defaultValue: 0,
      validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
    },
    {
      name: 'stockGG',
      label: 'Estoque GG',
      type: 'number',
      required: false,
      admin: {
        step: 1,
      },
      defaultValue: 0,
      validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
    },
    {
      name: 'photos',
      label: 'Imagens',
      type: 'array',
      fields: [
        {
          name: 'photo',
          label: 'Imagem',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'publishedOn',
      label: 'Publicar em',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        hidden: true,
      },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      label: 'Produtos Relacionados',
      relationTo: 'products',
      hasMany: true,
      filterOptions: ({ id }) => ({
        id: { not_in: [id] },
      }),
    },
    slugField(),
  ],
}

export default Products
