'use client';

import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  alt: string;
  cols?: number;
  rows?: number;
  className?: string;
};

// No leading space and start with a visible glyph, so even the brightest
// pixel renders something legible (avoids "empty slot" on bright photos).
const RAMP = ".,:;!iIlcvoxOC0XK#@";
// Compress luma so pure white still maps to the lightest visible char,
// and lift the dark end so darks still pick a heavy glyph.
const LUMA_MIN = 0.08;
const LUMA_MAX = 0.92;

export function GenerativePhoto({
  src,
  alt,
  cols = 36,
  rows = 46,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lumaRef = useRef<Float32Array | null>(null);
  const cursorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Cover-fit (crop to fill the slot completely, no letterbox).
      // Cell aspect compensation: monospace glyphs are roughly 2:1 tall:wide,
      // so adjust the source crop so the rendered ASCII looks proportional.
      const cellPxAspect = 0.5; // glyph width / glyph height
      const targetAspect = (cols * cellPxAspect) / rows;
      const srcAspect = img.width / img.height;
      let sx = 0;
      let sy = 0;
      let sw = img.width;
      let sh = img.height;
      if (srcAspect > targetAspect) {
        // image is wider than the slot — crop horizontally
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        // image is taller than the slot — crop vertically
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);

      const { data } = ctx.getImageData(0, 0, cols, rows);
      const luma = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const raw = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        // Compress to [LUMA_MIN, LUMA_MAX] so pure-white photos still show texture
        luma[i] = LUMA_MIN + raw * (LUMA_MAX - LUMA_MIN);
      }
      lumaRef.current = luma;
      render();
    };
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, cols, rows]);

  const render = () => {
    const luma = lumaRef.current;
    const pre = preRef.current;
    const wrap = wrapRef.current;
    if (!luma || !pre || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    const cellW = rect.width / cols;
    const cellH = rect.height / rows;

    const cursor = cursorRef.current;
    const localX = cursor.x - rect.left;
    const localY = cursor.y - rect.top;
    const radius = Math.min(rect.width, rect.height) * 0.18;

    const lines: string[] = [];
    for (let y = 0; y < rows; y++) {
      let line = '';
      for (let x = 0; x < cols; x++) {
        let l = luma[y * cols + x];
        if (cursor.active) {
          const px = x * cellW + cellW / 2;
          const py = y * cellH + cellH / 2;
          const d = Math.hypot(px - localX, py - localY);
          if (d < radius) {
            // perturbation: invert + boost density
            const w = 1 - d / radius;
            l = Math.min(1, l + 0.55 * w);
          }
        }
        const idx = Math.floor((1 - l) * (RAMP.length - 1));
        line += RAMP[idx] || ' ';
      }
      lines.push(line);
    }
    pre.textContent = lines.join('\n');
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY, active: true };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          render();
        });
      }
    };
    const onLeave = () => {
      cursorRef.current.active = false;
      render();
    };
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      className={className}
      aria-label={alt}
      role="img"
      style={{
        width: '100%',
        aspectRatio: `${cols} / ${rows}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <pre
        ref={preRef}
        className="font-mono"
        style={{
          margin: 0,
          fontSize: 'clamp(9px, 1vw, 12px)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontWeight: 500,
          color: 'hsl(var(--foreground))',
          whiteSpace: 'pre',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default GenerativePhoto;
