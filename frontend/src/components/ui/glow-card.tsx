import React, { useEffect, useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink' | 'cyan' | 'purple-blue';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
  noPadding?: boolean; 
}

const glowColorMap = {
  blue: { base: 220, spread: 10 },        // Reduced spread to lock Blue
  purple: { base: 270, spread: 10 },      // Reduced spread to lock Purple
  green: { base: 120, spread: 20 },
  red: { base: 0, spread: 20 },
  orange: { base: 30, spread: 20 },
  pink: { base: 320, spread: 10 },        // Locked Pink (Prevents Yellow shift)
  cyan: { base: 180, spread: 10 },        // Locked Cyan
  "purple-blue": { base: 240, spread: 20 } // Mix for AI Doctor
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
  noPadding = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.blue;

  const getSizeClasses = () => {
    if (customSize) return '';
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: any = {
      '--base': base,
      '--spread': spread,
      '--radius': '24',
      '--border': '2',
      '--backdrop': 'rgb(10 10 10 / 0.8)', // Dark semi-transparent background
      '--backup-border': 'rgb(255 255 255 / 0.1)',
      '--size': '250', // Spotlight size
      '--outer': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      
      // Main Background Image (Subtle Spotlight)
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) 80% 60% / 0.1), transparent
      )`,
      
      backgroundColor: 'var(--backdrop)',
      backgroundSize: '100% 100%',
      backgroundAttachment: 'fixed',
      border: 'var(--border-size) solid transparent', // Transparent border for the mask to work
      position: 'relative',
      touchAction: 'none',
    };

    if (width !== undefined) baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    if (height !== undefined) baseStyles.height = typeof height === 'number' ? `${height}px` : height;

    return baseStyles;
  };

  const beforeAfterStyles = `
    /* Creates the Glowing Border */
    [data-glow]::before {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      
      /* The Magic Mask: Shows background ONLY at the border area */
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect; 
      
      /* The Gradient that shines through the border mask */
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.8) calc(var(--spotlight-size) * 0.8) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) 90% 60% / 1), transparent 100%
      );
      z-index: 2;
    }
    
    /* Fallback static border if spotlight is far away */
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border-radius: calc(var(--radius) * 1px);
      border: var(--border-size) solid var(--backup-border);
      z-index: 1;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          rounded-3xl 
          relative 
          grid 
          backdrop-blur-md 
          ${noPadding ? 'p-0' : 'p-6 gap-4'}
          ${className}
        `}
      >
        {children}
      </div>
    </>
  );
};

export { GlowCard }