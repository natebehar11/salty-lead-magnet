'use client';

interface UnsplashAttributionProps {
  photographer: string;
  profileUrl: string;
}

export default function UnsplashAttribution({ photographer, profileUrl }: UnsplashAttributionProps) {
  return (
    <div className="absolute bottom-2 right-2 text-[10px] text-white/60 font-body">
      Photo by{' '}
      <a
        href={`${profileUrl}?utm_source=salty_retreats&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/80 transition-colors"
      >
        {photographer}
      </a>
      {' '}on{' '}
      <a
        href="https://unsplash.com/?utm_source=salty_retreats&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/80 transition-colors"
      >
        Unsplash
      </a>
    </div>
  );
}
