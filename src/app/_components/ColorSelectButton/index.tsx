'use client'
import React, { useState } from 'react';
import classes from './index.module.scss';

export const ColorSelectButton = ({ title = "Cor", colors }) => {
  const [selectedColor, setSelectedColor] = useState(colors[0].colorHex);
  const [selectedColorName, setSelectedColorName] = useState(colors[0].color);

  const handleColorSelection = (colorHex, colorName) => {
    setSelectedColor(colorHex);
    setSelectedColorName(colorName);
  };

  return (
    <div className={classes.colorSelectWrapper}>
      <div className={classes.colorLabelContainer}> {/* Container adicionado para título e nome da cor */}
        <span className={classes.colorLabel}>{title}: </span>
        <span className={classes.selectedColorName}>{selectedColorName}</span> {/* Exibe o nome da cor selecionada ao lado do título */}
      </div>
      <div className={classes.colorsContainer}>
        {colors.map(({ color, colorHex }, index) => (
          <button
            key={colorHex}
            className={`${classes.colorButton} ${selectedColor === colorHex ? 'selected' : ''}`}
            onClick={() => handleColorSelection(colorHex, color)}
            aria-label={`Select ${color}`}
          >
            <div className={`${classes.square} ${selectedColor === colorHex ? classes.filledSquare : ''}`} style={{ backgroundColor: colorHex }}></div>
           
          </button>
        ))}
      </div>
    </div>
  );
};
