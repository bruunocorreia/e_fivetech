'use client'

import { Gutter } from '../../../app/_components/Gutter'
import RichText from '../../../app/_components/RichText'
import { Page } from '../../../payload/payload-types'
import { Blocks } from '../../_components/Blocks'

import classes from './index.module.scss'

export const PageTemplate: React.FC<{ page: Page | null | undefined }> = ({ page }) => {
  const data = page

  return (
    <Gutter>
      <div className={classes.productView}>
        <Blocks blocks={data?.layout} disableTopPadding={true} />
      </div>
    </Gutter>
  )
}
