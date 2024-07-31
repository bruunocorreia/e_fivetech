'use client'

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { equal } from 'assert'
import qs from 'qs'

import { Category, Product } from '../../../payload/payload-types'
import type { ArchiveBlockProps } from '../../_blocks/ArchiveBlock/types'
import { useFilter } from '../../_providers/Filter'
import { Card } from '../Card'
import { PageRange } from '../PageRange'
import { Pagination } from '../Pagination'

import classes from './index.module.scss'

type Result = {
  totalDocs: number
  docs: Product[]
  page: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
  nextPage: number
  prevPage: number
}

export type Props = {
  className?: string
  relationTo?: 'products'
  populateBy?: 'collection' | 'selection'
  showPageRange?: boolean
  onResultChange?: (result: Result) => void // eslint-disable-line no-unused-vars
  limit?: number
  populatedDocs?: ArchiveBlockProps['populatedDocs']
  populatedDocsTotal?: ArchiveBlockProps['populatedDocsTotal']
  categories?: ArchiveBlockProps['categories']
  new?: ArchiveBlockProps['new']
  sale?: ArchiveBlockProps['sale']
  hot?: ArchiveBlockProps['hot']
}

export const CollectionArchive: React.FC<Props> = props => {
  const { categoryFilters, subCategoryFilters, colorFilters, sizeFilters, sort, searchTerm } =
    useFilter()

  const {
    className,
    relationTo,
    showPageRange,
    onResultChange,
    limit = 10,
    populatedDocs,
    populatedDocsTotal,
    new: newFilter,
    sale: saleFilter,
    hot: hotFilter,
  } = props

  const [results, setResults] = useState<Result>({
    totalDocs: typeof populatedDocsTotal === 'number' ? populatedDocsTotal : 0,
    docs: (populatedDocs?.map(doc => doc.value) || []) as [],
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: 1,
    nextPage: 1,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasHydrated = useRef(false)
  const [page, setPage] = useState(1)

  const debounce = (func, delay) => {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => func(...args), delay)
    }
  }

  const fetchProducts = useCallback(
    debounce(async () => {
      if (hasHydrated.current) {
        setIsLoading(true)
      }

      const whereConditions: any[] = []

      if (newFilter === true) {
        whereConditions.push({ new: { equals: newFilter } })
      }
      if (saleFilter === true) {
        whereConditions.push({ sale: { equals: saleFilter } })
      }
      if (hotFilter === true) {
        whereConditions.push({ hot: { equals: hotFilter } })
      }

      const searchQuery = qs.stringify(
        {
          // sort,
          where: {
            ...(categoryFilters &&
            categoryFilters.length > 0 &&
            subCategoryFilters &&
            subCategoryFilters.length > 0
              ? {
                  and: [
                    {
                      'categories.title': {
                        in: categoryFilters,
                      },
                    },
                    {
                      'categories.subtitle': {
                        in: subCategoryFilters,
                      },
                    },
                  ],
                }
              : categoryFilters && categoryFilters.length > 0
              ? {
                  'categories.title': {
                    in: categoryFilters,
                  },
                }
              : subCategoryFilters && subCategoryFilters.length > 0
              ? {
                  'categories.subtitle': {
                    in: subCategoryFilters,
                  },
                }
              : {}),
            ...(colorFilters && colorFilters.length > 0
              ? {
                  'colors.color': {
                    in: colorFilters,
                  },
                }
              : {}),
            ...(sizeFilters && sizeFilters.length > 0
              ? {
                  sizes: {
                    in: sizeFilters,
                  },
                }
              : {}),
            ...(searchTerm.trim() !== ''
              ? {
                  title: {
                    like: `${searchTerm}`,
                  },
                }
              : {}),

            _status: {
              equals: 'published', // Ajuste para a chave correta que representa a cor nos seus dados
            },

            ...(whereConditions.length > 0 ? { or: whereConditions } : {}),
          },
          limit,
          page,
          depth: 1,
        },
        { encode: false },
      )

      // Log the query to console
      console.log('Query string being sent:', searchQuery)

      try {
        const req = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/${relationTo}?${searchQuery}`,
        )
        const json = await req.json()

        hasHydrated.current = true

        const { docs } = json as { docs: Product[] }

        if (docs && Array.isArray(docs)) {
          setResults(json)
          setIsLoading(false)
          if (typeof onResultChange === 'function') {
            onResultChange(json)
          }
        }
      } catch (err) {
        console.warn(err) // eslint-disable-line no-console
        setIsLoading(false)
        setError(`Unable to load "${relationTo} archive" data at this time.`)
      }
    }, 500),
    [
      page,
      categoryFilters,
      subCategoryFilters,
      colorFilters,
      sizeFilters,
      relationTo,
      onResultChange,
      sort,
      limit,
      newFilter,
      saleFilter,
      hotFilter,
      searchTerm,
    ],
  )

  useEffect(() => {
    // Verifica se há filtros aplicados ou outras condições que justifiquem a busca
    if (
      categoryFilters.length > 0 ||
      subCategoryFilters.length > 0 ||
      colorFilters.length > 0 ||
      sizeFilters.length > 0 ||
      searchTerm.trim() !== '' ||
      newFilter ||
      saleFilter ||
      hotFilter ||
      true
    ) {
      fetchProducts()
    } else if (hasHydrated.current) {
      setIsLoading(false)
    }
  }, [fetchProducts])

  return (
    <div className={[classes.collectionArchive, className].filter(Boolean).join(' ')}>
      <div ref={scrollRef} className={classes.scrollRef} />
      {!isLoading && error && <div>{error}</div>}
      <Fragment>
        {showPageRange !== false && (
          <div className={classes.pageRange}>
            <PageRange
              totalDocs={results.totalDocs}
              currentPage={results.page}
              collection={relationTo}
              limit={limit}
            />
          </div>
        )}

        <div className={classes.grid}>
          {results.docs?.map((result, index) => {
            return (
              <Card
                className={classes.card}
                key={index}
                relationTo="products"
                doc={result}
                showCategories
              />
            )
          })}
        </div>

        {results.totalPages > 1 && (
          <Pagination
            className={classes.pagination}
            page={results.page}
            totalPages={results.totalPages}
            onClick={setPage}
          />
        )}
      </Fragment>
    </div>
  )
}
