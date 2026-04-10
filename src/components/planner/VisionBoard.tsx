'use client';

import { useState, useCallback } from 'react';
import { Reorder, motion } from 'motion/react';
import { Retreat } from '@/types';
import { TopLevelBoardItem, BoardViewMode } from '@/types/vision-board';
import { usePlannerStore } from '@/stores/planner-store';
import { groupBoardItemsByCountry, getBoardItemCount, getBoardCityCount, getBoardTotalDays } from '@/lib/board-utils';
import VisionBoardCountrySection from './VisionBoardCountrySection';
import RetreatCard from './RetreatCard';
import VisionBoardEmpty from './VisionBoardEmpty';
import ItineraryView from './ItineraryView';
import TripCostEstimator from './TripCostEstimator';

const VIEW_TABS: { mode: BoardViewMode; label: string; icon: string }[] = [
  { mode: 'dream', label: 'Dream Board', icon: '✨' },
  { mode: 'itinerary', label: 'Itinerary', icon: '📋' },
];

interface VisionBoardProps {
  retreat: Retreat;
  onShareClick: () => void;
  onEmailClick: () => void;
}

export default function VisionBoard({ retreat, onShareClick, onEmailClick }: VisionBoardProps) {
  const boardItems = usePlannerStore((s) => s.boardItems);
  const topLevelOrder = usePlannerStore((s) => s.topLevelOrder);
  const cityOrderByCountry = usePlannerStore((s) => s.cityOrderByCountry);
  const removeBoardItem = usePlannerStore((s) => s.removeBoardItem);
  const clearBoardItems = usePlannerStore((s) => s.clearBoardItems);
  const updateBoardItemImage = usePlannerStore((s) => s.updateBoardItemImage);
  const setMobileActiveTab = usePlannerStore((s) => s.setMobileActiveTab);
  const setTopLevelOrder = usePlannerStore((s) => s.setTopLevelOrder);
  const boardViewMode = usePlannerStore((s) => s.boardViewMode);
  const setBoardViewMode = usePlannerStore((s) => s.setBoardViewMode);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const countryGroups = groupBoardItemsByCountry(boardItems, topLevelOrder, cityOrderByCountry);
  const countryMap = new Map(countryGroups.map((g) => [g.country, g]));
  const itemCount = getBoardItemCount(boardItems);
  const cityCount = getBoardCityCount(boardItems);
  const totalDays = getBoardTotalDays(boardItems);

  const handleImageLoad = useCallback(
    (cityName: string, imageUrl: string) => {
      const cityItem = boardItems.find(
        (item) => item.type === 'city' && item.cityName === cityName
      );
      if (cityItem) {
        updateBoardItemImage(cityItem.id, imageUrl);
      }
    },
    [boardItems, updateBoardItemImage]
  );

  function handleClearBoard() {
    clearBoardItems();
    setShowClearConfirm(false);
  }

  const handleReorder = useCallback(
    (newOrder: TopLevelBoardItem[]) => {
      setTopLevelOrder(newOrder);
    },
    [setTopLevelOrder]
  );

  if (boardItems.length === 0) {
    return <VisionBoardEmpty onSwitchToChat={() => setMobileActiveTab('chat')} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-salty-beige/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm text-salty-deep-teal tracking-wider uppercase">
              Your Trip Board
            </h2>
            {/* Trip stats pills */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 font-body text-[11px] px-2 py-0.5 rounded-full bg-salty-seafoam/20 text-salty-deep-teal">
                🏙 {cityCount} {cityCount === 1 ? 'city' : 'cities'}
              </span>
              <span className="inline-flex items-center gap-1 font-body text-[11px] px-2 py-0.5 rounded-full bg-salty-light-blue/20 text-salty-deep-teal">
                📍 {itemCount} {itemCount === 1 ? 'spot' : 'spots'}
              </span>
              {totalDays > 0 && (
                <span className="inline-flex items-center gap-1 font-body text-[11px] px-2 py-0.5 rounded-full bg-salty-yellow/20 text-salty-deep-teal">
                  📅 ~{totalDays + retreat.duration.days} days
                </span>
              )}
            </div>
          </div>

          {/* Clear board */}
          <div className="relative flex-shrink-0">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="font-body text-[11px] text-salty-slate/30 hover:text-salty-orange-red transition-colors px-2 py-1"
                aria-label="Clear all items from board"
              >
                Clear
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1"
              >
                <button
                  onClick={handleClearBoard}
                  className="font-body text-[11px] text-salty-orange-red hover:text-salty-burnt-red transition-colors px-2 py-1 font-bold"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="font-body text-[11px] text-salty-slate/40 hover:text-salty-slate transition-colors px-1 py-1"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-salty-cream/60 rounded-full p-0.5" role="tablist" aria-label="Board view mode">
          {VIEW_TABS.map(({ mode, label, icon }) => (
            <button
              key={mode}
              role="tab"
              aria-selected={boardViewMode === mode}
              onClick={() => setBoardViewMode(mode)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[11px] tracking-wider uppercase transition-all ${
                boardViewMode === mode
                  ? 'bg-white text-salty-deep-teal shadow-sm'
                  : 'text-salty-slate/40 hover:text-salty-slate/60'
              }`}
            >
              <span className="text-sm">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Board content — switches based on view mode */}
      {boardViewMode === 'dream' ? (
        <>
          {/* Dream Board: Reorderable Country > City > Items */}
          <Reorder.Group
            axis="y"
            values={topLevelOrder}
            onReorder={handleReorder}
            as="div"
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {topLevelOrder.map((entry) => {
              if (entry.kind === 'retreat') {
                return (
                  <Reorder.Item key="__retreat__" value={entry} as="div">
                    <RetreatCard retreat={retreat} />
                  </Reorder.Item>
                );
              }

              const group = countryMap.get(entry.country);
              if (!group) return null;

              return (
                <Reorder.Item key={entry.country} value={entry} as="div">
                  <VisionBoardCountrySection
                    group={group}
                    onRemoveItem={removeBoardItem}
                    onImageLoad={handleImageLoad}
                  />
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </>
      ) : (
        <ItineraryView retreat={retreat} />
      )}

      {/* Trip cost estimator */}
      <TripCostEstimator retreat={retreat} />

      {/* Bottom actions */}
      {itemCount >= 1 && (
        <div className="px-4 py-3 border-t border-salty-beige/30 space-y-2">
          <button
            onClick={onShareClick}
            aria-label="Share trip board with friends"
            className="w-full rounded-full bg-salty-orange-red text-white font-display text-xs tracking-wider uppercase px-6 py-3 hover:bg-salty-burnt-red transition-colors active:scale-[0.98]"
          >
            Share with Friends
          </button>
          <button
            onClick={onEmailClick}
            aria-label="Save trip board to email"
            className="w-full rounded-full border-2 border-salty-deep-teal text-salty-deep-teal font-display text-xs tracking-wider uppercase px-6 py-2.5 hover:bg-salty-deep-teal hover:text-white transition-colors active:scale-[0.98]"
          >
            Save My Board
          </button>
        </div>
      )}
    </div>
  );
}
