import { ImageResponse } from 'next/og';
import { getPlan } from '@/lib/shared-plans';

export const runtime = 'edge';
export const alt = 'SALTY Trip Board';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlan(id);

  if (!plan) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#0E3A2D',
            color: '#F7F4ED',
            fontSize: 48,
            fontFamily: 'sans-serif',
          }}
        >
          SALTY Trip Board
        </div>
      ),
      { ...size },
    );
  }

  const isV2 = 'version' in plan && plan.version === 2;
  const itemCount = isV2
    ? plan.boardItems.filter((i) => i.type !== 'city').length
    : 0;
  const cityCount = isV2
    ? new Set(plan.boardItems.filter((i) => i.type === 'city').map((i) => i.cityName)).size
    : 0;
  const friendCount = plan.friends.length;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0E3A2D',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: SALTY branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#F75A3D',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
          >
            SALTY TRIP BOARD
          </div>
        </div>

        {/* Middle: Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#F7F4ED',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            {plan.creatorName}&apos;s trip to {plan.retreatName}
          </div>

          {plan.retreatDates && (
            <div
              style={{
                fontSize: 24,
                color: '#F7F4ED',
                opacity: 0.6,
                marginBottom: '32px',
              }}
            >
              {plan.retreatDates}
            </div>
          )}

          {/* Stats row */}
          {isV2 && (
            <div
              style={{
                display: 'flex',
                gap: '32px',
              }}
            >
              {cityCount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(247, 244, 237, 0.1)',
                    padding: '12px 24px',
                    borderRadius: '16px',
                  }}
                >
                  <span style={{ fontSize: 28 }}>🏙</span>
                  <span style={{ fontSize: 22, color: '#F7F4ED', fontWeight: 600 }}>
                    {cityCount} {cityCount === 1 ? 'city' : 'cities'}
                  </span>
                </div>
              )}
              {itemCount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(247, 244, 237, 0.1)',
                    padding: '12px 24px',
                    borderRadius: '16px',
                  }}
                >
                  <span style={{ fontSize: 28 }}>📍</span>
                  <span style={{ fontSize: 22, color: '#F7F4ED', fontWeight: 600 }}>
                    {itemCount} activities
                  </span>
                </div>
              )}
              {friendCount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(247, 244, 237, 0.1)',
                    padding: '12px 24px',
                    borderRadius: '16px',
                  }}
                >
                  <span style={{ fontSize: 28 }}>👥</span>
                  <span style={{ fontSize: 22, color: '#F7F4ED', fontWeight: 600 }}>
                    {friendCount + 1} going
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom: CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: '#F7F4ED',
              opacity: 0.5,
            }}
          >
            explore.getsaltyretreats.com
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#F75A3D',
              padding: '14px 32px',
              borderRadius: '999px',
              fontSize: 18,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
            }}
          >
            JOIN THE PLAN
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
