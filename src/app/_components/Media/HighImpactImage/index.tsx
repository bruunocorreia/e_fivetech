'use client';

import React, { useEffect, useState, useRef } from 'react';
import NextImage from 'next/image';

import cssVariables from '../../../cssVariables';
import { Props as MediaProps } from '../types';

import classes from './index.module.scss';

const { breakpoints } = cssVariables;

export const HighImpactImage: React.FC<MediaProps & { allowImageControls?: boolean }> = props => {
  const {
    imgClassName,
    onClick,
    onLoad: onLoadFromProps,
    resources,
    priority,
    fill,
    allowImageControls = true,
  } = props;
  const [gridColumns, setGridColumns] = useState('repeat(1, 1fr)');

  const handleLoad = () => {
    if (typeof onLoadFromProps === 'function') {
      onLoadFromProps();
    }
  };

  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth;
      if (width <= 450) {
        setGridColumns('repeat(1, 1fr)');
      } else if (width <= 800) {
        setGridColumns('repeat(2, 1fr)');
      } else {
        setGridColumns(`repeat(${resources?.length || 1}, 1fr)`);
      }
    };

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);

    return () => {
      window.removeEventListener('resize', updateGridColumns);
    };
  }, [resources]);

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: gridColumns,
    width: '100%',
    margin: '0 auto',
  };

  const sizes = Object.entries(breakpoints)
    .map(([, value]) => `(max-width: ${value}px) ${value}px`)
    .join(', ');

  const ControlledImage = ({ resource, index }) => {
    const containerRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
      const initialZoomHeight = 800 / resource.height;
      const initialZoomWidth = 800 / resource.width;
      const initialZoom = Math.max(initialZoomHeight, initialZoomWidth);
      setZoom(initialZoom);
    }, [resource.height, resource.width]);

    const handleMouseDown = (e) => {
      e.preventDefault();
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
      containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.clientX - startPos.x;
      const y = e.clientY - startPos.y;
      setPosition({ x, y });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      containerRef.current.style.cursor = 'grab';
    };

    const handleWheel = (e) => {
      e.preventDefault(); // Impede o comportamento padrão de scroll
      e.stopPropagation(); // Impede a propagação do evento para evitar que a página role
      setZoom((prevZoom) => Math.max(1, prevZoom - e.deltaY * 0.001));
    };

    useEffect(() => {
      const currentRef = containerRef.current;
      if (currentRef) {
        currentRef.addEventListener('wheel', handleWheel, { passive: false });
      }
      return () => {
        if (currentRef) {
          currentRef.removeEventListener('wheel', handleWheel);
        }
      };
    }, []);

    return (
      <div
        className={`${classes.imageContainer}`}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: 'grab' }}
      >
        <div className={classes.imageWrapper}>
          <NextImage
            className={[classes.image, imgClassName].filter(Boolean).join(' ')}
            src={`${process.env.NEXT_PUBLIC_SERVER_URL}/media/${resource.filename}`}
            alt={resource.alt || ''}
            onClick={onClick}
            onLoad={handleLoad}
            layout="responsive"
            width={resource.width}
            height={resource.height}
            sizes={sizes}
            priority={priority}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle} className={`${classes.highImpactImageContainer}`}>
      {resources?.map((resource, index) => (
        <ControlledImage resource={resource} index={index} key={index} />
      ))}
    </div>
  );
};
