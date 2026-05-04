'use client';

import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  alt: string;
  cols?: number;
  rows?: number;
  className?: string;
};

const RAMP = " .,:;!iIlcvoxOC0XK#@";

export function GenerativePhoto({
  src,
  alt,
  cols = 56,
  rows = 70,
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

      const aspect = img.width / img.height;
      const cellAspect = cols / rows;
      let dw = cols;
      let dh = rows;
      if (aspect > cellAspect) {
        dh = cols / aspect;
      } else {
        dw = rows * aspect;
      }
      const dx = (cols - dw) / 2;
      const dy = (rows - dh) / 2;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cols, rows);
      ctx.drawImage(img, dx, dy, dw, dh);

      const { data } = ctx.getImageData(0, 0, cols, rows);
      const luma = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        // perceptual luminance, normalized 0..1
        luma[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
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
          fontSize: 'clamp(6px, 0.62vw, 9px)',
          lineHeight: 1,
          letterSpacing: 0,
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
