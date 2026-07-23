import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * MasonryGrid — Pinterest-style layout with independent columns.
 *
 * Renders items instantly without flickering, re-animating, or black box re-fading on scroll.
 *
 * Props:
 *   items      — array of data items to render
 *   renderItem — (item, index) => JSX
 *   gap        — pixel gap between columns and rows (default 16)
 */
export default function MasonryGrid({ items, renderItem, gap = 16, columns: customColCount }) {
  const containerRef = useRef(null);
  const [colCount, setColCount] = useState(customColCount || 4);

  // ── Responsive column count based on container width ──────────
  useEffect(() => {
    if (customColCount) {
      setColCount(customColCount);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const updateCols = () => {
      const w = el.offsetWidth;
      if (w <= 480)      setColCount(2);
      else if (w <= 768) setColCount(3);
      else               setColCount(4);
    };

    updateCols();

    const ro = new ResizeObserver(updateCols);
    ro.observe(el);
    return () => ro.disconnect();
  }, [customColCount]);

  // ── Distribute items into columns (round-robin, deterministic) ─
  const columns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => []);
    if (Array.isArray(items)) {
      items.forEach((item, i) => {
        cols[i % colCount].push({ item, index: i });
      });
    }
    return cols;
  }, [items, colCount]);

  return (
    <div
      ref={containerRef}
      className="masonry-grid"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: `${gap}px`,
        width: '100%',
        margin: '30px 0',
      }}
    >
      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          className="masonry-grid__column"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`,
            minWidth: 0,
          }}
        >
          {col.map(({ item, index }) => (
            <div
              key={item.keyId || index}
              className="masonry-grid__item"
              style={{ width: '100%' }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
