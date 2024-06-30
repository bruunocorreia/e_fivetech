'use client'

import React, { useRef, useState } from 'react'

import classes from './index.module.scss'

// Helper function to organize categories
const organizeCategories = categories => {
  const catMap = {}
  if (categories && Array.isArray(categories)) {
    categories.forEach(cat => {
      if (cat.title) {
        if (!catMap[cat.title]) {
          catMap[cat.title] = []
        }
        catMap[cat.title].push({
          id: cat.id,
          subtitle: cat.subtitle,
          category: cat.category,
          slug: cat.slug,
        })
      }
    })
  }
  return catMap
}

// Function to handle navigation
const handleNavigation = url => {
  window.location.href = url
}

// Dropdown component to handle dropdown logic
const Dropdown = ({ title, categoriesMap, isOpen, onMouseEnter, onMouseLeave, onClick }) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ position: 'relative' }}
    >
      <span className={classes.buttonLink}>
        {title}
      </span>
      {isOpen && (
        <div className={classes.dropdownMenuVertical}>
          {Object.entries(categoriesMap).map(([category, items], index) => (
            <div key={index} className={classes.dropdownColumn}>
              <span className={`${classes.dropdownItem} ${classes.boldUnderlineDropdownItem}`}>
                {category.toUpperCase()}
              </span>
              {items.map(item => (
                <span
                  key={item.id}
                  className={classes.dropdownItem}
                  onClick={() => handleNavigation(`/products/${item.slug}`)}
                >
                  {item.subtitle.toUpperCase()}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Header component
export const HeaderComponent = ({ categories }) => {
  const [dropdownStates, setDropdownStates] = useState({
    peças: false,
    emAlta: false,
    sale: false,
    newIn: false,
  })

  const categoriesMap = organizeCategories(categories)
  const timerRefs = useRef({})

  const toggleDropdown = (buttonName, state) => {
    if (timerRefs.current[buttonName]) {
      clearTimeout(timerRefs.current[buttonName])
    }

    if (state) {
      setDropdownStates(prevStates => ({
        ...prevStates,
        [buttonName]: true,
      }))
    } else {
      timerRefs.current[buttonName] = setTimeout(() => {
        setDropdownStates(prevStates => ({
          ...prevStates,
          [buttonName]: false,
        }))
      }, 200)
    }
  }

  const handleDropdownClick = (buttonName) => {
    setDropdownStates(prevStates => ({
      ...prevStates,
      [buttonName]: !prevStates[buttonName],
    }))
  }

  return (
    <div className={classes.headerButtons}>
      {/* New in */}
      <span className={classes.buttonLink} onClick={() => handleNavigation('/new-in')}>
        New in
      </span>

      {/* Peças */}
      <Dropdown
        title="Peças"
        categoriesMap={categoriesMap}
        isOpen={dropdownStates.peças}
        onMouseEnter={() => toggleDropdown('peças', true)}
        onMouseLeave={() => toggleDropdown('peças', false)}
        onClick={() => handleDropdownClick('peças')}
      />

      {/* Em Alta */}
      <span className={classes.buttonLink} onClick={() => handleNavigation('/hot')}>
        Em Alta
      </span>

      {/* Sale */}
      <span className={classes.buttonLink} onClick={() => handleNavigation('/sale')}>
        Sale
      </span>
    </div>
  )
}
