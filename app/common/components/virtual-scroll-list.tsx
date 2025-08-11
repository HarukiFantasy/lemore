// PHASE 3 OPTIMIZATION: Virtual Scrolling for Performance
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  renderItem,
  className = ''
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Calculate total height and visible items
  const totalHeight = items.length * itemHeight;
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      result.push({
        item: items[i],
        index: i,
        offsetY: i * itemHeight
      });
    }
    return result;
  }, [items, visibleRange, itemHeight]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, offsetY }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetY,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Grid version for product cards
interface VirtualScrollGridProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  itemsPerRow: number;
  gap?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualScrollGrid<T>({
  items,
  itemHeight,
  containerHeight,
  itemsPerRow,
  gap = 16,
  overscan = 2,
  renderItem,
  className = ''
}: VirtualScrollGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate rows and visible range
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const rowHeight = itemHeight + gap;
  
  const visibleRowRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.floor((scrollTop + containerHeight) / rowHeight) + overscan
    );
    return { startRow, endRow };
  }, [scrollTop, rowHeight, containerHeight, overscan, totalRows]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    const result = [];
    for (let row = visibleRowRange.startRow; row <= visibleRowRange.endRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < items.length) {
          result.push({
            item: items[index],
            index,
            row,
            col,
            offsetY: row * rowHeight
          });
        }
      }
    }
    return result;
  }, [items, visibleRowRange, itemsPerRow, rowHeight]);

  const totalHeight = totalRows * rowHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleRowRange.startRow <= visibleRowRange.endRow && (
          <>
            {Array.from({ length: visibleRowRange.endRow - visibleRowRange.startRow + 1 }, (_, rowIndex) => {
              const actualRow = visibleRowRange.startRow + rowIndex;
              const rowItems = visibleItems.filter(item => item.row === actualRow);
              
              return (
                <div
                  key={actualRow}
                  style={{
                    position: 'absolute',
                    top: actualRow * rowHeight,
                    left: 0,
                    right: 0,
                    height: itemHeight,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
                    gap: `${gap}px`,
                  }}
                >
                  {rowItems.map(({ item, index }) => (
                    <div key={index}>
                      {renderItem(item, index)}
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}