'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Product } from '../../../payload/payload-types'
import { useCart } from '../../_providers/Cart'
import { Button, Props } from '../Button'

import classes from './index.module.scss'

export const AddToCartButton: React.FC<{
  product: Product
  quantity?: number
  selectedColor: string
  selectedSize: string
  className?: string
  appearance?: Props['appearance']
}> = props => {
  const {
    product,
    quantity = 1,
    selectedColor,
    selectedSize,
    className,
    appearance = 'primary',
  } = props

  const { cart, addItemToCart, isProductInCart, hasInitializedCart } = useCart()

  const [isInCart, setIsInCart] = useState<boolean>()
  const [showPopup, setShowPopup] = useState<boolean>(false) // Estado para o pop-up
  const router = useRouter()

  useEffect(() => {
    setIsInCart(isProductInCart({ product, selectedSize, selectedColor }))
  }, [isProductInCart, product, cart, selectedSize, selectedColor])

  const handleAddToCart = () => {
    addItemToCart({
      product,
      quantity,
      selectedColor,
      selectedSize,
    })

    // Mostra o pop-up e esconde após 3 segundos
    setShowPopup(true)
    setTimeout(() => {
      setShowPopup(false)
    }, 3000)
  }

  return (
    <>
      <Button
        href={isInCart ? '/cart' : undefined}
        type={!isInCart ? 'button' : undefined}
        label={isInCart ? '✓ Ver na sacola' : 'Adicionar à sacola'}
        el={isInCart ? 'link' : undefined}
        appearance={appearance}
        className={[
          className,
          classes.addToCartButton,
          appearance === 'default' && isInCart && classes.green,
          !hasInitializedCart && classes.hidden,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={!isInCart ? handleAddToCart : undefined}
      />

      {/* Pop-up de confirmação */}
      {showPopup && <div className={classes.popup}>Item adicionado à sacola!</div>}
    </>
  )
}
