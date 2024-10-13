import { slateEditor } from '@payloadcms/richtext-slate'
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
      hidden: false,
      defaultValue: 100,
    },
    {
      name: 'Y_position',
      type: 'number',
      required: false,
      hidden: false,
      defaultValue: 100,
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
      type: 'richText',
      required: false,
      hidden: true,
      editor: slateEditor({
        admin: {
          elements: ['link'],
        },
      }),
    },
  ],
}
