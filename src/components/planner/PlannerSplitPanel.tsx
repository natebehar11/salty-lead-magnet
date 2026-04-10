'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Retreat } from '@/types';
import { usePlannerStore } from '@/stores/planner-store';
import { getBoardItemCount } from '@/lib/board-utils';
import PlannerChatPanel from './PlannerChatPanel';
import VisionBoard from './VisionBoard';
import LeadCaptureModal from './LeadCaptureModal';
import PlannerErrorBoundary from './PlannerErrorBoundary';

interface PlannerSplitPanelProps {
  retreat: Retreat;
}

type ShareMode = 'share' | 'email';

export default function PlannerSplitPanel({ retreat }: PlannerSplitPanelProps) {
  const mobileActiveTab = usePlannerStore((s) => s.mobileActiveTab);
  const setMobileActiveTab = usePlannerStore((s) => s.setMobileActiveTab);
  const boardItems = usePlannerStore((s) => s.boardItems);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [shareMode, setShareMode] = useState<ShareMode>('share');

  const boardItemCount = getBoardItemCount(boardItems);

  function openModal(mode: ShareMode) {
    setShareMode(mode);
    setShowLeadCapture(true);
  }

  return (
    <>
      {/* Mobile tab toggle */}
      <div className="lg:hidden flex bg-surface-base/60 rounded-xl p-1 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <button
          onClick={() => setMobileActiveTab('chat')}
          className={`flex-1 py-2.5 rounded-lg font-display text-xs tracking-wider uppercase transition-colors ${
            mobileActiveTab === 'chat'
              ? 'bg-salty-deep-teal text-white'
              : 'text-salty-deep-teal/50 hover:text-salty-deep-teal'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMobileActiveTab('board')}
          className={`flex-1 py-2.5 rounded-lg font-display text-xs tracking-wider uppercase transition-colors relative ${
            mobileActiveTab === 'board'
              ? 'bg-salty-deep-teal text-white'
              : 'text-salty-deep-teal/50 hover:text-salty-deep-teal'
          }`}
        >
          My Board
          {boardItemCount > 0 && (
            <motion.span
              key={boardItemCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 size-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-salty-coral text-white"
            >
              {boardItemCount}
            </motion.span>
          )}
        </button>
      </div>

      {/* Split panel — uses dynamic viewport height on mobile for better fit */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 lg:gap-0 min-h-[600px] lg:min-h-[calc(100dvh-280px)] rounded-2xl overflow-hidden bg-surface-base/30" style={{ boxShadow: 'var(--shadow-card-resting)' }}>
        {/* Chat panel — left side */}
        <div
          className={`${
            mobileActiveTab === 'chat' ? 'block' : 'hidden'
          } lg:block lg:border-r border-salty-sand/30 bg-surface-base/40`}
        >
          <div className="h-[calc(100dvh-220px)] lg:h-full lg:sticky lg:top-20">
            <PlannerErrorBoundary panelName="chat">
              <PlannerChatPanel retreat={retreat} />
            </PlannerErrorBoundary>
          </div>
        </div>

        {/* Vision board — right side */}
        <div
          className={`${
            mobileActiveTab === 'board' ? 'block' : 'hidden'
          } lg:block bg-surface-warm-light/30`}
        >
          <div className="h-[calc(100dvh-220px)] lg:h-full overflow-y-auto">
            <PlannerErrorBoundary panelName="board">
              <VisionBoard
                retreat={retreat}
                onShareClick={() => openModal('share')}
                onEmailClick={() => openModal('email')}
              />
            </PlannerErrorBoundary>
          </div>
        </div>
      </div>

      {/* Lead capture modal */}
      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        retreat={retreat}
        mode={shareMode}
      />
    </>
  );
}
