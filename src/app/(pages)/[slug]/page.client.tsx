// src/app/(pages)/[slug]/page.client.tsx

'use client';

import { Blocks } from '../../_components/Blocks';
import ExitPreviewButton from '../../_components/ExitPreview';
import Filters from '../products/Filters';
import { Gutter } from '../../../app/_components/Gutter';
import { Hero } from '../../_components/Hero';
import React from 'react';
import classes from './index.module.scss';
import { useLivePreview } from '@payloadcms/live-preview-react';

export const PageTemplate: React.FC<{
  page: Page | null | undefined;
  slug: string;
  categories: Category[] | null;
  isDraftMode: boolean;
}> = ({ page, slug, categories, isDraftMode }) => {
  const { hero, layout } = page || {};

  const pageTitle =
    page?.title === 'hot' || page?.title === 'em-alta' ? 'Em Alta' : page?.title;

  return (
    <>
      {isDraftMode && (
        <div
          style={{
            backgroundColor: 'yellow',
            padding: '10x',
            textAlign: 'center',
            position: 'fixed',
            width: '100%',
            top: 0,
            left: 0,
            zIndex: 1000,
          }}
        >
          Você está no modo de pré-visualização
          <ExitPreviewButton />
        </div>
      )}
      {slug === 'home' ? (
        <section>
          <Hero {...hero} isPreview={isDraftMode} />
        </section>
      ) : (
        <>
          <Hero {...hero} isPreview={isDraftMode} /> {/* Added isPreview prop here */}
          {hero?.type !== 'highImpact' && (
            <>
              <div className={classes.filters}>
                <Filters
                  categories={categories}
                  colors={categories}
                  page_name={pageTitle}
                  preselectedCategory={categories}
                />
              </div>
              <Gutter>
                <Blocks
                  blocks={layout}
                  disableTopPadding={!hero || hero?.type === 'none' || hero?.type === 'lowImpact'}
                />
              </Gutter>
            </>
          )}
        </>
      )}
    </>
  );
};
