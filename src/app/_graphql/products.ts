import { ARCHIVE_BLOCK, CALL_TO_ACTION, CONTENT, MEDIA_BLOCK } from './blocks';

import { MEDIA_FIELDS } from './media';
import { PRODUCT_CATEGORIES } from './categories';
import { PRODUCT_COLORS } from './colors';

export const PRODUCTS = `
  query Products {
    Products(limit: 300) {
      docs {
        slug
        stock
      }
    }
  }
`;

export const PRODUCT = `
  query Product($slug: String, $draft: Boolean) {
    Products(where: { slug: { equals: $slug } }, limit: 1, draft: $draft) {
      docs {
        id
        title
        stock
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
`;

export const PRODUCT_PAYWALL = `
  query Product($slug: String, $draft: Boolean) {
    Products(where: { slug: { equals: $slug } }, limit: 1, draft: $draft) {
      docs {
        paywall {
          ${CALL_TO_ACTION}
          ${CONTENT}
          ${MEDIA_BLOCK}
          ${ARCHIVE_BLOCK}
        }
      }
    }
  }
`;
