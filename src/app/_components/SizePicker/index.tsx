'use client'

import React, { useState } from 'react'

import classes from './index.module.scss'

/*
  Aqui, a prop "sizes" será interpretada como os tamanhos disponíveis no estoque.
  A lista completa de tamanhos é definida internamente como "allSizes".
*/
export const SizePicker = ({ sizes: availableSizes, onSizeSelect }) => {
  const allSizes = ['PP', 'P', 'M', 'G', 'GG']  // Lista completa de opções
  const [selectedSize, setSelectedSize] = useState(null)
  
  const handleSizeSelection = (size, isAvailable) => {
    if (!isAvailable) return  // Não faz nada se o tamanho não estiver disponível
    setSelectedSize(size)
    onSizeSelect(size)
  }
  
  return (
    <div>
      <div className={classes.sizeOptions}>
        {allSizes.map(size => {
          const isAvailable = availableSizes.includes(size)
          return (
            <button
              key={size}
              disabled={!isAvailable}
              onClick={() => handleSizeSelection(size, isAvailable)}
              className={`
                ${classes.sizeButton} 
                ${selectedSize === size ? classes.selectedSize : ''} 
                ${!isAvailable ? classes.disabled : ''}
              `}
            >
              <span className={!isAvailable ? classes.strike : ''}>
                {size}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
