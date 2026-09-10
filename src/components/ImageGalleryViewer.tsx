import { useEffect, useState } from 'react';

interface ImageGalleryViewerProps {
  images: string[];
  alt: string;
  containerClassName?: string;
}

export default function ImageGalleryViewer({ images, alt, containerClassName }: ImageGalleryViewerProps) {
  const safe = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [safe.join('|')]);

  return (
    <div className="flex flex-col gap-2">
      <div
        className={
          containerClassName ??
          'rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950'
        }
      >
        {safe.length > 0 ? (
          <img src={safe[index]} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
            No image
          </div>
        )}
      </div>

      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safe.map((src, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                i === index ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <img src={src} alt={`${alt} view ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}