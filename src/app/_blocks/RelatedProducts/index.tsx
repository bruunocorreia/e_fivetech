import React from 'react'

import { Product } from '../../../payload/payload-types'
import { RelatedProductsCard } from '../../_components/Card'
import { Gutter } from '../../_components/Gutter'
import RichText from '../../_components/RichText'

import classes from './index.module.scss'

export type RelatedProductsProps = {
  blockType: 'relatedProducts'
  blockName: string
  introContent?: any
  docs?: (string | Product)[]
  relationTo: 'products'
}

export const RelatedProducts: React.FC<RelatedProductsProps> = props => {
  const { docs, relationTo } = props
  console.log(docs)

  return (
    <div className={classes.relatedProducts}>
      <Gutter>
        <h3 className={classes.title}>Produtos Relacionados</h3>
        <div className={classes.grid}>
          {docs?.map(doc => {
            if (typeof doc === 'string') return null
            // Verifique se o preço e o desconto estão corretos
            console.log('Preço: ', doc.price, 'Desconto: ', doc.discountPercentage)

            return (
              <RelatedProductsCard
                key={doc.id}
                relationTo={relationTo}
                doc={doc}
                showCategories
                // Passar o preço e desconto para o cartão de produtos
                price={doc.price} // Corrigido: acessar doc.price
                discountPercentage={doc.discountPercentage} // Corrigido: acessar doc.discountPercentage
              />
            )
          })}
        </div>
      </Gutter>
    </div>
  )
}
