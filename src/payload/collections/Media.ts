import path from 'path'
import type { CollectionConfig } from 'payload/types'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(__dirname, '../../../media'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'X_position',
      type: 'number',
      required: false,
      defaultValue: 0,
    },
    {
      name: 'Y_position',
      type: 'number',
      required: false,
      defaultValue: 0,
    },
    {
      name: 'zoom',
      type: 'number',
      required: false,
      defaultValue: 1,
    },
    {
      name: 'alt',
      type: 'text',
      required: false,
      hidden: true,
      defaultValue: '.',
    },
    {
      name: 'caption',
      type: 'text',
      required: false,
      hidden: true,
      defaultValue: '1;0;0',
    },
  ],
}
