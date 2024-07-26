{
  /* eslint-disable @next/next/no-img-element */
}

import React from 'react'
import Link from 'next/link'

import { fetchDocs } from '../../_api/fetchDocs'
import { fetchHeader } from '../../_api/fetchGlobals'
import { Gutter } from '../../_components/Gutter'
import HamburgerMenu from './HamburgerComponent'
import { HeaderComponent } from './HeaderComponent'
import { HeaderNav } from './Nav'

import classes from './index.module.scss'

export async function Header() {
  let header = null
  let categories = null

  try {
    categories = await fetchDocs('categories')
  } catch (error) {
    console.log(error)
  }

  try {
    header = await fetchHeader()
  } catch (error) {
    console.log(error)
  }

  return (
    <Gutter className={classes.gutter}>
      <header className={classes.header}>
        <Link href="/">
          <img className={classes.logo} alt="Minimo 1" src="/minimo_1_small.jpeg" />
        </Link>
        <div className={`${classes.hideOnMobile}`}></div>
        <div className={classes.hideOnMobile}>
          <HeaderComponent categories={categories} />
          <HeaderNav header={header} />
        </div>
        <HamburgerMenu categories={categories} />
      </header>
    </Gutter>
  )
}
