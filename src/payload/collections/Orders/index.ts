import type { CollectionConfig } from 'payload/types'

import ExportButton from '../../../app/_components/ExportButton'
import { admins } from '../../access/admins'
import { adminsOrOrderedBy } from './access/adminsOrOrderedBy'
import { clearUserCart } from './hooks/clearUserCart'
import { populateOrderedBy } from './hooks/populateOrderedBy'
import { updateUserPurchases } from './hooks/updateUserPurchases'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { plural: 'Pedidos', singular: 'Pedido' },
  admin: {
    useAsTitle: 'createdAt',
    description: 'Pedidos',
    defaultColumns: ['createdAt', 'orderedBy'],
    components: {
      BeforeListTable: [ExportButton],
    },
  },
  hooks: {
    afterChange: [updateUserPurchases, clearUserCart],
  },
  access: {
    read: adminsOrOrderedBy,
    update: admins,
    create: () => false,
    delete: admins,
  },
  fields: [
    {
      name: 'orderedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
      hooks: {
        beforeChange: [populateOrderedBy],
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      admin: { readOnly: true },
    },
    {
      name: 'shipped',
      label: 'Enviado',
      type: 'checkbox',
    },
    {
      name: 'delivered',
      label: 'Entregue',
      type: 'checkbox',
    },
    {
      name: 'items',
      type: 'array',
      admin: { readOnly: true },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          admin: { readOnly: true },
        },
        {
          name: 'price',
          type: 'number',
          min: 0,
          admin: { readOnly: true },
        },
        {
          name: 'quantity',
          type: 'number',
          min: 0,
          admin: { readOnly: true },
        },
        {
          name: 'selectedSize',
          label: 'Tamanho',
          type: 'text',
          required: true,
          admin: { readOnly: true },
        },
        {
          name: 'selectedColor',
          label: 'Cor',
          type: 'text',
          required: true,
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'shippingTicket',
      label: 'Etiqueta de Envio',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'shippingZipCode',
      label: 'CEP',
      type: 'number',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'shippingHouseNumber',
      label: 'Número',
      type: 'number',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'shippingComplement',
      label: 'Complemento',
      type: 'text',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'userSocialId',
      label: 'CPF',
      type: 'number',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'userPhoneNumber',
      label: 'Telefone',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
  ],
}
