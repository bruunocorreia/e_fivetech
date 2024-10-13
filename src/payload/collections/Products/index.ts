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
          data.newprice = originalDoc.newprice
        }
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.sale && data.price && data.discountPercentage) {
          data.newprice = data.price - (data.price * data.discountPercentage) / 100
        } else if (!data.sale) {
          data.newprice = 1
        } else {
          data.newprice = originalDoc.newprice
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
    update: admins,
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
      name: 'slider', // required
      type: 'array', // required
      label: 'Estoque',
      minRows: 1,
      validate: async (val, args) => {
        // Verifica se `val` é válido e contém mais de um item
        if (!val || val.length <= 1) {
          return true;
        }

        const combinacoesVistas: string[] = [];
        for (const item of val) {
          const combinacao = `${item.colors}-${item.sizes}`;


          // Se a combinação já foi vista, retorna a mensagem de erro
          if (combinacoesVistas.includes(combinacao)) {
            return `A variação ${combinacao} já foi cadastrada`; // Retorna a mensagem de erro se duplicado
          }

          // Caso contrário, adiciona a combinação ao Set
          combinacoesVistas.push(combinacao);
        }

        // Se não encontrar duplicidades, retorna true
        return true;

      },

      interfaceName: 'CardSlider', // optional
      labels: {
        singular: 'Variação',
        plural: 'Variações',
      },
      fields: [
        {
          name: 'colors',
          label: 'Cores disponíveis',
          type: 'relationship',
          relationTo: 'colors',
          hasMany: false,
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
          hasMany: false,
        },
        {
          name: 'stock',
          type: 'number',
          label: 'Estoque',
          required: true,
          admin: {
            step: 1.0,
          },
        },
      ],

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
      name: 'installments',
      label: 'Máx. Parcelas',
      type: 'select',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
      ],
      hasMany: true,
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
