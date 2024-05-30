'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { Header as HeaderType, User } from '../../../../payload/payload-types'
import { useAuth } from '../../../_providers/Auth'
import { CartLink } from '../../CartLink'
import { CMSLink } from '../../Link'
import SearchBar from '../../SearchBar/index'

import classes from './index.module.scss'

export const HeaderNav: React.FC<{ header: HeaderType }> = ({ header }) => {
  const navItems = header?.navItems || []
  const { user } = useAuth()
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  // Handler for search action
  const handleSearch = (query: string) => {
    console.log(`Search query: ${query}`)
    // Implement the search functionality here
  }

  const toggleSearchBar = () => {
    setIsSearchVisible(!isSearchVisible)
  }

  return (
    <div>
      <nav
        className={[
          classes.nav,
          // fade the nav in on user load to avoid flash of content and layout shift
          // Vercel também faz isso em seu próprio cabeçalho de site, veja https://vercel.com
          user === undefined && classes.hide,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} appearance="none" />
        })}
        <Link href="https://www.instagram.com" target="_blank">
          <Image src="/instagram.png" alt="Instagram" className={classes.socialIcon} width={24} height={24} />
        </Link>
        <Link href="https://www.tiktok.com" target="_blank">
          <Image src="/tiktok.png" alt="TikTok" className={classes.socialIcon} width={24} height={24} />
        </Link>
        <Link href="/products">
          <Image src="/search.png" alt="Search" className={classes.socialIcon} width={24} height={24} />
        </Link>
        {user && (
          <Link href="/account">
            <Image className={classes.socialIcon} alt="Minha Conta" src="/user_profile.png" width={24} height={24} />
          </Link>
        )}
        {!user && (
          <React.Fragment>
            <Link href="/login">
              <Image src="/login.png" alt="Login" className={classes.socialIcon} width={24} height={24} />
            </Link>
          </React.Fragment>
        )}
        <CartLink />
      </nav>
    </div>
  )
}
