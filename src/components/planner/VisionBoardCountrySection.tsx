'use client';

import { Reorder } from 'motion/react';
import { BoardCountryGroup } from '@/types/vision-board';
import { usePlannerStore } from '@/stores/planner-store';
import VisionBoardCityGroup from './VisionBoardCityGroup';
import DragHandle from './DragHandle';

interface VisionBoardCountrySectionProps {
  group: BoardCountryGroup;
  onRemoveItem: (itemId: string) => void;
  onImageLoad: (cityName: string, imageUrl: string) => void;
}

/**
 * Renders one country group on the vision board.
 * - Country header with drag handle (drag is handled by parent Reorder.Item)
 * - Nested Reorder.Group for cities when 2+ cities exist
 */
export default function VisionBoardCountrySection({
  group,
  onRemoveItem,
  onImageLoad,
}: VisionBoardCountrySectionProps) {
  const setCityOrder = usePlannerStore((s) => s.setCityOrder);
  const cityOrderByCountry = usePlannerStore((s) => s.cityOrderByCountry);

  const cityOrder = cityOrderByCountry[group.country] || group.cities.map((c) => c.cityName);

  // Build lookup for rendering in order
  const cityMap = new Map(group.cities.map((c) => [c.cityName, c]));

  const handleCityReorder = (newOrder: string[]) => {
    setCityOrder(group.country, newOrder);
  };

  const hasMultipleCities = group.cities.length > 1;

  return (
    <div className="space-y-2">
      {/* Country header */}
      <div className="flex items-center gap-2 px-1">
        <DragHandle />
        <h3 className="font-display text-[11px] tracking-widest uppercase text-salty-slate/50 flex-shrink-0">
          {group.country}
        </h3>
        <div className="flex-1 h-px bg-salty-beige/40" />
      </div>

      {/* Cities */}
      {hasMultipleCities ? (
        <Reorder.Group
          axis="y"
          values={cityOrder}
          onReorder={handleCityReorder}
          as="div"
          className="space-y-3"
        >
          {cityOrder.map((cityName) => {
            const city = cityMap.get(cityName);
            if (!city) return null;
            return (
              <Reorder.Item key={cityName} value={cityName} as="div">
                <VisionBoardCityGroup
                  group={city}
                  onRemoveItem={onRemoveItem}
                  onImageLoad={onImageLoad}
                  draggable
                />
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      ) : (
        // Single city — no inner reorder needed
        <VisionBoardCityGroup
          group={group.cities[0]}
          onRemoveItem={onRemoveItem}
          onImageLoad={onImageLoad}
        />
      )}
    </div>
  );
}
