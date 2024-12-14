// src/collections/Products/index.ts

import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { ConditionalText } from '../../fields/conditionalText'
import { slugField } from '../../fields/slug'
import { revalidateProduct } from './hooks/revalidateProduct'

const Products: CollectionConfig = {
  slug: 'products',
  labels: { plural: 'Produtos', singular: 'Produto' },
  admin: {
    useAsTitle: 'title',
    preview: doc => {
      return `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/preview?url=${encodeURIComponent(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/products/${doc.slug}`,
      )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`
    },
    defaultColumns: ['title', 'price', 'discountPercentage', '_status'],
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

        // Remover tamanhos sem estoque
        if (data.stock && Array.isArray(data.sizes)) {
          data.sizes = data.sizes.filter(size => {
            const stockValue = data.stock[size]
            return stockValue && stockValue > 0
          })

          // Adicionar tamanhos com estoque > 0 caso ainda não estejam no array sizes
          const allSizes = ['PP', 'P', 'M', 'G', 'GG']
          allSizes.forEach(size => {
            const stockValue = data.stock[size]
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
      },
    },
    {
      name: 'stock',
      label: 'Estoque por Tamanho',
      type: 'group',
      fields: [
        {
          name: 'PP',
          label: 'PP',
          type: 'number',
          required: true,
          admin: {
            step: 1,
          },
          defaultValue: 0,
          validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
        },
        {
          name: 'P',
          label: 'P',
          type: 'number',
          required: true,
          admin: {
            step: 1,
          },
          defaultValue: 0,
          validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
        },
        {
          name: 'M',
          label: 'M',
          type: 'number',
          required: true,
          admin: {
            step: 1,
          },
          defaultValue: 0,
          validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
        },
        {
          name: 'G',
          label: 'G',
          type: 'number',
          required: true,
          admin: {
            step: 1,
          },
          defaultValue: 0,
          validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
        },
        {
          name: 'GG',
          label: 'GG',
          type: 'number',
          required: true,
          admin: {
            step: 1,
          },
          defaultValue: 0,
          validate: value => (value >= 0 ? true : 'O estoque não pode ser negativo.'),
        },
      ],
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
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: [id],
          },
        }
      },
    },
    slugField(),
  ],
}

export default Products
