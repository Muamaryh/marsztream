'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableRowProps {
  children: React.ReactNode;
  className?: string;
  arrowClassName?: string;
}

export function ScrollableRow({ children, className = '', arrowClassName = '' }: ScrollableRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft: sLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(sLeft > 5);
      setCanScrollRight(sLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scrollBy = (offset: number) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Mouse wheel horizontal scroll support
  const handleWheel = (e: React.WheelEvent) => {
    if (rowRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      rowRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!rowRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeft.current = rowRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Scroll speed multiplier
    rowRef.current.scrollLeft = scrollLeft.current - walk;
    checkScroll();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative group/scroll w-full">
      {/* Left Arrow Button */}
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-320)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--primary)] hover:scale-110 active:scale-95 transition-all select-none ${arrowClassName}`}
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4 text-[#18181b] dark:text-white" />
        </button>
      )}

      {/* Scrollable Container with Drag Support */}
      <div
        ref={rowRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none ${className}`}
      >
        {children}
      </div>

      {/* Right Arrow Button */}
      {canScrollRight && (
        <button
          onClick={() => scrollBy(320)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--primary)] hover:scale-110 active:scale-95 transition-all select-none ${arrowClassName}`}
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4 text-[#18181b] dark:text-white" />
        </button>
      )}
    </div>
  );
}
