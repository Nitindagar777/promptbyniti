import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * MasonryGrid — Pinterest-style layout with independent columns.
 *
 * Unlike CSS column-count (which reflows ALL items when content changes),
 * this distributes items into separate vertical columns. When new items
 * load via infinite scroll, they are appended to the shortest column —
 * existing items never move.
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
      if (w <= 480)      setColCount(2); // 2 columns on mobile portrait (standard Pinterest mobile view)
      else if (w <= 768) setColCount(3); // 3 columns on tablet
      else               setColCount(4); // 4 columns on desktop
    };

    updateCols();

    const ro = new ResizeObserver(updateCols);
    ro.observe(el);
    return () => ro.disconnect();
  }, [customColCount]);

  // ── Distribute items into columns (round-robin, deterministic) ─
  const columns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => []);
    items.forEach((item, i) => {
      cols[i % colCount].push({ item, index: i });
    });
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
            minWidth: 0,  /* prevents flex overflow */
          }}
        >
          {col.map(({ item, index }) => (
            <div key={item.keyId || index} className="masonry-grid__item">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
