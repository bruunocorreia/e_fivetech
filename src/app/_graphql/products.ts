import { PRODUCT_CATEGORIES } from './categories'
import { PRODUCT_COLORS } from './colors'
import { MEDIA_FIELDS } from './media'

export const PRODUCTS = `
  query Products {
    Products(limit: 300) {
      docs {
        slug
        stock {
          PP
          P
          M
          G
          GG
        }
      }
    }
  }
`

export const PRODUCT = `
  query Product($slug: String, $draft: Boolean) {
    Products(where: { slug: { equals: $slug } }, limit: 1, draft: $draft) {
      docs {
        id
        title
        stock {
          PP
          P
          M
          G
          GG
        }
        ${PRODUCT_CATEGORIES}
        price
        discountPercentage
        description
        composition
        slug
        relatedProducts {
          id
          slug
          title
          price
          discountPercentage
          photos {
            photo {
              ${MEDIA_FIELDS}
            }
          }
        }
        ${PRODUCT_COLORS}
        sizes
        photos {
          photo {
            ${MEDIA_FIELDS}
          }
        }
      }
    }
  }
`
