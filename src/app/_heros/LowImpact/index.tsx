import React from 'react'

import { Page } from '../../../payload/payload-types'
import { Gutter } from '../../_components/Gutter'
import { DefaultMedia, HighImpactMedia } from '../../_components/Media'
import RichText from '../../_components/RichText'

import classes from './index.module.scss'

export const LowImpactHero: React.FC<Page['hero']> = ({ media }) => {
  // Se media for null ou undefined, não renderiza nada
  if (!media) {
    return null
  }

  const mainMedia = [media]
  console.log(mainMedia, 'debuf')

  return (
    <div className={classes.content}>
      <div className={classes.imageContainer}>
        <DefaultMedia resources={mainMedia} priority />
      </div>
    </div>
  )
}
