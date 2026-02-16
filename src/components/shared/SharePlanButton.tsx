'use client';

import { useState } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import { cn } from '@/lib/utils';
import Button from './Button';

interface SharePlanButtonProps {
  retreatSlug: string;
  retreatName: string;
  retreatDates: string;
}

export default function SharePlanButton({ retreatSlug, retreatName, retreatDates }: SharePlanButtonProps) {
  const { originAirport, favouriteFlightIds, leadData } = useFlightStore();
  const [isCreating, setIsCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState(leadData?.firstName || '');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name) return;
    setIsCreating(true);

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: name,
          retreatSlug,
          retreatName,
          retreatDates,
          originCity: originAirport?.city || '',
          flights: [], // Could include favourite flights here
          message,
        }),
      });

      const data = await res.json();
      if (data.plan?.id) {
        const url = `${window.location.origin}/plan/${data.plan.id}`;
        setShareUrl(url);
      }
    } catch (error) {
      console.error('Failed to create shared plan:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (shareUrl) {
    return (
      <div className="bg-salty-sand/50 rounded-xl p-4 text-center">
        <p className="font-display text-sm text-salty-deep-teal mb-2">Share this link with your crew</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 bg-salty-cream rounded-lg font-body text-xs text-salty-deep-teal border border-salty-beige"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-salty-orange-red text-white font-body text-xs font-bold rounded-full hover:bg-salty-burnt-red transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="font-body text-[10px] text-salty-slate/40">
          Anyone with this link can see your trip plan and signal interest
        </p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="bg-salty-sand/50 rounded-xl p-4">
        <p className="font-display text-sm text-salty-deep-teal mb-3">Share your trip plan</p>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-salty-beige bg-salty-cream font-body text-sm focus:outline-none focus:border-salty-orange-red"
          />
          <textarea
            placeholder="Add a message for your friends (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-salty-beige bg-salty-cream font-body text-sm resize-none h-16 focus:outline-none focus:border-salty-orange-red"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreate} variant="primary" size="sm" disabled={!name || isCreating} className="flex-1">
              {isCreating ? 'Creating...' : 'Create Share Link'}
            </Button>
            <Button onClick={() => setShowForm(false)} variant="ghost" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className={cn(
        'w-full py-3 px-4 rounded-full border-2 border-salty-deep-teal/20',
        'font-body text-sm font-bold text-salty-deep-teal',
        'hover:border-salty-deep-teal/40 hover:bg-salty-deep-teal/5 transition-all',
        'flex items-center justify-center gap-2'
      )}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share with friends
      {favouriteFlightIds.length > 0 && (
        <span className="bg-salty-orange-red/10 text-salty-orange-red px-2 py-0.5 rounded-full text-[10px]">
          {favouriteFlightIds.length} flights saved
        </span>
      )}
    </button>
  );
}
