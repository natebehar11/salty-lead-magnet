export default function FlightCardSkeleton() {
  return (
    <div className="bg-salty-cream rounded-xl border-2 border-salty-beige p-5 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-3 w-24 bg-salty-beige rounded mb-3" />
          <div className="flex items-center gap-3">
            <div>
              <div className="h-6 w-12 bg-salty-beige rounded mb-1" />
              <div className="h-3 w-8 bg-salty-beige/50 rounded" />
            </div>
            <div className="flex-1 h-px bg-salty-beige" />
            <div>
              <div className="h-6 w-12 bg-salty-beige rounded mb-1" />
              <div className="h-3 w-8 bg-salty-beige/50 rounded" />
            </div>
          </div>
          <div className="h-3 w-20 bg-salty-beige/50 rounded mt-2" />
        </div>
        <div className="text-right">
          <div className="h-8 w-16 bg-salty-beige rounded mb-2" />
          <div className="h-7 w-16 bg-salty-beige rounded-full" />
        </div>
      </div>
    </div>
  );
}
