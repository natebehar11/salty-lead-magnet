'use client';

interface DragHandleProps {
  className?: string;
}

/** 6-dot grip icon — purely visual. Drag behavior comes from Reorder.Item wrapping. */
export default function DragHandle({ className = '' }: DragHandleProps) {
  return (
    <div
      className={`cursor-grab active:cursor-grabbing text-salty-slate/30 hover:text-salty-slate/50 transition-colors flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="3" cy="2" r="1.2" />
        <circle cx="9" cy="2" r="1.2" />
        <circle cx="3" cy="6" r="1.2" />
        <circle cx="9" cy="6" r="1.2" />
        <circle cx="3" cy="10" r="1.2" />
        <circle cx="9" cy="10" r="1.2" />
      </svg>
    </div>
  );
}
