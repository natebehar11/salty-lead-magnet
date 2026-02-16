'use client';

type WaveVariant = 'sunset' | 'ocean' | 'warm' | 'cool' | 'earth' | 'lines' | 'linesSun' | 'linesBlueWhite' | 'linesGoldSand' | 'linesCoralSun' | 'linesTealOrange';

interface WaveDividerProps {
  variant?: WaveVariant;
  flip?: boolean;
  className?: string;
}

const waveColors: Record<Exclude<WaveVariant, 'lines' | 'linesSun' | 'linesBlueWhite' | 'linesGoldSand' | 'linesCoralSun' | 'linesTealOrange'>, string[]> = {
  sunset: ['#FF7E70', '#FED260', '#F75A3D', '#CCB4B3'],
  ocean: ['#B6D4EA', '#A4E5D9', '#0E3A2D', '#3A6B35'],
  warm: ['#FED260', '#F75A3D', '#C74235', '#FF7E70'],
  cool: ['#A4E5D9', '#B6D4EA', '#0E3A2D', '#CCB4B3'],
  earth: ['#E7D7C0', '#0E3A2D', '#3A6B35', '#CCB4B3'],
};

export default function WaveDivider({ variant = 'sunset', flip = false, className = '' }: WaveDividerProps) {
  if (variant === 'lines') {
    const topColor = flip ? '#F75A3D' : '#b6d4ea';
    const bottomColor = flip ? '#b6d4ea' : '#F75A3D';

    return (
      <div className={`w-full leading-[0] ${className}`} aria-hidden="true">
        <div className="h-[6px] w-full" style={{ backgroundColor: topColor }} />
        <div className="h-[6px] w-full" style={{ backgroundColor: bottomColor }} />
      </div>
    );
  }

  if (variant === 'linesSun') {
    return (
      <div className={`w-full leading-[0] ${className}`} aria-hidden="true">
        <div className="h-[6px] w-full bg-[#FED260]" />
        <div className="h-[6px] w-full bg-[#0E3A2D]" />
      </div>
    );
  }

  if (variant === 'linesBlueWhite') {
    return (
      <div className={`w-full leading-[0] ${className}`} aria-hidden="true">
        <div className="h-[6px] w-full bg-[#0E3A2D]" />
        <div className="h-[6px] w-full bg-[#f75a3d]" />
      </div>
    );
  }

  if (variant === 'linesGoldSand') {
    return (
      <div className={`w-full leading-[0] ${className}`} aria-hidden="true">
        <div className="h-[6px] w-full bg-salty-gold" />
        <div className="h-[6px] w-full bg-salty-sand" />
      </div>
    );
  }

  if (variant === 'linesCoralSun') {
    return (
      <div className={`w-full leading-[0] ${className}`} aria-hidden="true">
        <div className="h-[6px] w-full bg-[#F75A3D]" />
        <div className="h-[6px] w-full bg-[#FED260]" />
      </div>
    );
  }

  if (variant === 'linesTealOrange') {
    return (
      <div className={`w-full leading-[0] ${className}`} aria-hidden="true">
        <div className="h-[6px] w-full bg-[#0E3A2D]" />
        <div className="h-[6px] w-full bg-[#F75A3D]" />
      </div>
    );
  }

  const colors = waveColors[variant];

  return (
    <div
      className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px]"
      >
        {/* Layer 4 — back */}
        <path
          d="M0,80 C160,100 320,40 480,60 C640,80 800,100 960,80 C1120,60 1280,40 1440,60 L1440,120 L0,120 Z"
          fill={colors[3]}
          opacity="0.3"
        />
        {/* Layer 3 */}
        <path
          d="M0,70 C180,90 360,50 540,70 C720,90 900,50 1080,70 C1260,90 1380,50 1440,70 L1440,120 L0,120 Z"
          fill={colors[2]}
          opacity="0.4"
        />
        {/* Layer 2 */}
        <path
          d="M0,85 C200,65 400,95 600,85 C800,75 1000,95 1200,85 C1350,78 1420,90 1440,85 L1440,120 L0,120 Z"
          fill={colors[1]}
          opacity="0.5"
        />
        {/* Layer 1 — front */}
        <path
          d="M0,95 C240,80 480,110 720,95 C960,80 1200,110 1440,95 L1440,120 L0,120 Z"
          fill={colors[0]}
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
