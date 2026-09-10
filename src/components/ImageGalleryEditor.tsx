import React, { useRef, useState } from 'react';
import ImageCropper from './ImageCropper';
import { MAX_GALLERY_SIZE } from '../utils/images';

interface ImageGalleryEditorProps {
  images: string[];
  aspect: number;
  targetWidth?: number;
  onChange: (images: string[]) => void;
  hint?: string;
}

export default function ImageGalleryEditor({
  images,
  aspect,
  targetWidth = 800,
  onChange,
  hint
}: ImageGalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState<(string | null)[]>(() =>
    Array(images.length).fill(null)
  );
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  const commit = (url: string) => {
    if (cropIndex === null) return;
    if (cropIndex >= images.length) {
      onChange([...images, url]);
    } else {
      onChange(images.map((img, i) => (i === cropIndex ? url : img)));
    }
    setCropIndex(null);
  };

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
    setRaw((prev) => prev.filter((_, i) => i !== idx));
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (images.length >= MAX_GALLERY_SIZE) return;
    const target = images.length;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setRaw((prev) => {
        const c = prev.slice();
        while (c.length <= target) c.push(null);
        c[target] = dataUrl;
        return c;
      });
      setCropIndex(target);
    };
    reader.readAsDataURL(file);
  };

  const slotClass =
    'w-20 h-14 rounded-lg border border-zinc-700 overflow-hidden bg-zinc-950 relative shrink-0';
  const ghostClass =
    'flex items-center justify-center text-zinc-700 border-dashed cursor-not-allowed';

  return (
    <div className="w-full">
      {cropIndex !== null && raw[cropIndex] ? (
        <div>
          <p className="text-[10px] text-zinc-400 mb-2">
            Cropping picture {cropIndex + 1} of {MAX_GALLERY_SIZE}
          </p>
          <ImageCropper
            src={raw[cropIndex] as string}
            aspect={aspect}
            targetWidth={targetWidth}
            onApply={commit}
            onCancel={() => commit(raw[cropIndex] as string)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-400">
              {hint ?? 'Front view, side views, rear, interior…'}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {images.length}/{MAX_GALLERY_SIZE} pictures
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: MAX_GALLERY_SIZE }).map((_, i) => {
              if (i < images.length) {
                return (
                  <div key={i} className={`${slotClass} group`}>
                    <img
                      src={images[i]}
                      alt={`Picture ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-0.5 left-1 text-[9px] font-mono bg-black/70 text-zinc-300 px-1 rounded">
                      {i + 1}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                      {raw[i] && (
                        <button
                          onClick={() => setCropIndex(i)}
                          className="flex-1 py-0.5 bg-black/70 text-[9px] text-amber-300 hover:text-amber-200"
                        >
                          Crop
                        </button>
                      )}
                      <button
                        onClick={() => remove(i)}
                        className="flex-1 py-0.5 bg-red-600/90 text-[9px] text-white hover:bg-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }
              if (i === images.length) {
                return (
                  <button
                    key={i}
                    onClick={() => inputRef.current && inputRef.current.click()}
                    className={`${slotClass} ${ghostClass} border-red-600/60 hover:border-red-500 hover:text-red-400 cursor-pointer text-sm`}
                    title="Add picture"
                  >
                    +
                  </button>
                );
              }
              return (
                <div key={i} className={`${slotClass} ${ghostClass}`}>
                  +
                </div>
              );
            })}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
        </>
      )}
    </div>
  );
}