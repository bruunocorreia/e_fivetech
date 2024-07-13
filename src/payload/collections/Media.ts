import type { CollectionConfig } from 'payload/types'
import path from 'path'
import { slateEditor } from '@payloadcms/richtext-slate'

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
      defaultValue: '.',
      editor: slateEditor({
        admin: {
          elements: ['link'],
        },
      }),
    },
  ],
}
