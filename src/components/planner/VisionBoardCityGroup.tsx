'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { BoardCityGroup } from '@/types/vision-board';
import { REGION_GRADIENTS, REGION_GRADIENT_FALLBACK } from '@/lib/constants';
import VisionBoardItem from './VisionBoardItem';
import UnsplashAttribution from './UnsplashAttribution';
import DragHandle from './DragHandle';

interface VisionBoardCityGroupProps {
  group: BoardCityGroup;
  onRemoveItem: (itemId: string) => void;
  onImageLoad?: (cityName: string, imageUrl: string) => void;
  /** When true, shows a drag handle — used when city is inside a multi-city country section */
  draggable?: boolean;
}

export default function VisionBoardCityGroup({ group, onRemoveItem, onImageLoad, draggable }: VisionBoardCityGroupProps) {
  const [photoData, setPhotoData] = useState<{
    url: string;
    photographer: string;
    profileUrl: string;
  } | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (group.imageUrl) {
      setPhotoData({ url: group.imageUrl, photographer: '', profileUrl: '' });
      return;
    }

    let cancelled = false;

    async function fetchPhoto() {
      try {
        const query = `${group.cityName} ${group.country} travel`;
        const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}&orientation=landscape`);
        if (!res.ok || cancelled) return;

        const data = await res.json();
        if (cancelled) return;

        setPhotoData({
          url: data.url,
          photographer: data.attribution.photographer,
          profileUrl: data.attribution.profileUrl,
        });

        onImageLoad?.(group.cityName, data.url);
      } catch {
        // Use gradient fallback
      }
    }

    fetchPhoto();
    return () => { cancelled = true; };
  }, [group.cityName, group.country, group.imageUrl, onImageLoad]);

  const gradientClass = REGION_GRADIENTS[group.country] || REGION_GRADIENT_FALLBACK;

  return (
    <div className="rounded-2xl overflow-hidden bg-white/50 border border-salty-beige/40 shadow-sm">
      {/* City hero image — tall and striking like a Pinterest card */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        {photoData?.url && !imageError ? (
          <>
            <Image
              src={photoData.url}
              alt={`${group.cityName}, ${group.country}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              onError={() => setImageError(true)}
            />
            {photoData.photographer && (
              <UnsplashAttribution
                photographer={photoData.photographer}
                profileUrl={photoData.profileUrl}
              />
            )}
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />
        )}

        {/* Stronger overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* City name overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-2">
          {draggable && <DragHandle className="text-white/40 hover:text-white/70 mb-0.5" />}
          <div className="flex-1">
            <h3 className="font-display text-white text-xl tracking-wider uppercase leading-tight drop-shadow-sm">
              {group.cityName}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              {group.days > 0 && (
                <span className="font-body text-white/80 text-xs">
                  {group.days} {group.days === 1 ? 'day' : 'days'}
                </span>
              )}
              {group.items.length > 0 && (
                <span className="font-body text-white/60 text-xs">
                  {group.items.length} {group.items.length === 1 ? 'spot' : 'spots'} saved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity items — more spacing for visual breathing room */}
      {group.items.length > 0 && (
        <div className="p-3 flex flex-col gap-1.5">
          <AnimatePresence mode="popLayout">
            {group.items.map((item) => (
              <VisionBoardItem key={item.id} item={item} onRemove={onRemoveItem} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
