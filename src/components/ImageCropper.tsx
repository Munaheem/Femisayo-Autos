import React, { useEffect, useRef, useState } from 'react';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se';

interface ImageCropperProps {
  src: string;
  aspect: number;
  targetWidth?: number;
  onApply: (dataUrl: string) => void;
  onCancel: () => void;
}

const MIN_CROP = 40;

export default function ImageCropper({
  src,
  aspect,
  targetWidth = 800,
  onApply,
  onCancel
}: ImageCropperProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ mode: DragMode; startX: number; startY: number } | null>(null);

  const [dims, setDims] = useState<{ w: number; h: number; nw: number; nh: number } | null>(null);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [dragging, setDragging] = useState(false);

  const dimsRef = useRef(dims);
  const cropRef = useRef(crop);
  dimsRef.current = dims;
  cropRef.current = crop;

  useEffect(() => {
    const img = new Image();
    imgRef.current = img;
    img.onload = () => {
      const el = wrapRef.current;
      if (!el) return;
      const maxW = el.clientWidth - 2;
      const maxH = 300;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      setDims({ w, h, nw: img.naturalWidth, nh: img.naturalHeight });
      let cw = w;
      let ch = h;
      if (w / h > aspect) {
        ch = h;
        cw = h * aspect;
      } else {
        cw = w;
        ch = w / aspect;
      }
      setCrop({ x: (w - cw) / 2, y: (h - ch) / 2, w: cw, h: ch });
    };
    img.onerror = () => {
      imgRef.current = null;
      setDims(null);
    };
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
      imgRef.current = null;
    };
  }, [src, aspect]);

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  const onPointerDown = (e: React.PointerEvent, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cropRef.current) return;
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      const d = dimsRef.current;
      const c = cropRef.current;
      if (!drag || !d || !c) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      let nx = c.x;
      let ny = c.y;
      let nw = c.w;
      let nh = c.h;

      if (drag.mode === 'move') {
        nx = clamp(c.x + dx, 0, d.w - c.w);
        ny = clamp(c.y + dy, 0, d.h - c.h);
      } else if (drag.mode === 'se') {
        nw = clamp(c.w + dx, MIN_CROP, d.w - c.x);
        nh = nw / aspect;
        if (c.y + nh > d.h) {
          nh = d.h - c.y;
          nw = nh * aspect;
        }
        nw = clamp(nw, MIN_CROP, d.w - c.x);
        nh = nw / aspect;
      } else if (drag.mode === 'ne') {
        nw = clamp(c.w + dx, MIN_CROP, d.w - c.x);
        nh = nw / aspect;
        if (c.y + c.h - nh < 0) {
          nh = c.y + c.h;
          nw = nh * aspect;
        }
        nw = clamp(nw, MIN_CROP, d.w - c.x);
        nh = nw / aspect;
        ny = c.y + c.h - nh;
      } else if (drag.mode === 'sw') {
        nw = clamp(c.w - dx, MIN_CROP, c.x + c.w);
        nh = nw / aspect;
        if (c.y + nh > d.h) {
          nh = d.h - c.y;
          nw = nh * aspect;
        }
        nw = clamp(nw, MIN_CROP, c.x + c.w);
        nh = nw / aspect;
        nx = c.x + c.w - nw;
      } else if (drag.mode === 'nw') {
        nw = clamp(c.w - dx, MIN_CROP, c.x + c.w);
        nh = nw / aspect;
        if (c.y + c.h - nh < 0) {
          nh = c.y + c.h;
          nw = nh * aspect;
        }
        nw = clamp(nw, MIN_CROP, c.x + c.w);
        nh = nw / aspect;
        nx = c.x + c.w - nw;
        ny = c.y + c.h - nh;
      }

      setCrop({ x: nx, y: ny, w: nw, h: nh });
    };

    const onUp = () => {
      dragRef.current = null;
      setDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, aspect]);

  const handleApply = () => {
    const img = imgRef.current;
    const d = dimsRef.current;
    const c = cropRef.current;
    if (!img || !d || !c) return;
    const scale = d.nw / d.w;
    const outW = targetWidth;
    const outH = Math.round(outW / aspect);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, c.x * scale, c.y * scale, c.w * scale, c.h * scale, 0, 0, outW, outH);
    onApply(canvas.toDataURL('image/jpeg', 0.85));
  };

  const handleStyle: React.CSSProperties = {
    left: crop ? crop.x : 0,
    top: crop ? crop.y : 0,
    width: crop ? crop.w : 0,
    height: crop ? crop.h : 0,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)'
  };

  return (
    <div className="w-full">
      <div ref={wrapRef} className="w-full rounded-lg bg-black overflow-hidden">
        <div className="flex justify-center min-h-[160px]">
          {dims && crop ? (
            <div className="relative touch-none" style={{ width: dims.w, height: dims.h }}>
              <img
                src={src}
                alt="Crop preview"
                draggable={false}
                className="block max-w-none select-none"
                style={{ width: dims.w, height: dims.h }}
              />
              <div
                className="absolute border-2 border-red-500 cursor-move"
                style={handleStyle}
                onPointerDown={(e) => onPointerDown(e, 'move')}
              >
                <span
                  className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-sm cursor-nwse-resize"
                  onPointerDown={(e) => onPointerDown(e, 'nw')}
                />
                <span
                  className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-sm cursor-nesw-resize"
                  onPointerDown={(e) => onPointerDown(e, 'ne')}
                />
                <span
                  className="absolute -left-1.5 -bottom-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-sm cursor-nesw-resize"
                  onPointerDown={(e) => onPointerDown(e, 'sw')}
                />
                <span
                  className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-sm cursor-nwse-resize"
                  onPointerDown={(e) => onPointerDown(e, 'se')}
                />
                <div className="absolute inset-0 pointer-events-none border border-white/30" />
              </div>
            </div>
          ) : (
            <div className="w-full min-h-[160px] flex items-center justify-center text-xs text-zinc-500 py-10">
              Loading image…
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-3">
        <span className="text-[10px] text-zinc-500">
          Drag to position · corner handles to resize
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
          >
            Keep Original
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}