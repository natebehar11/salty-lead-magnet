import { NextRequest, NextResponse } from 'next/server';
import { FlightOption } from '@/types/flight';
import { formatDuration } from '@/lib/utils';

const GHL_V2_BASE = process.env.GHL_V2_API_BASE || 'https://services.leadconnectorhq.com';
const GHL_V2_TOKEN = process.env.GHL_V2_API_TOKEN || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_FROM_EMAIL = process.env.GHL_FROM_EMAIL || 'hello@getsaltyretreats.com';

function isV2Configured(): boolean {
  return Boolean(GHL_V2_TOKEN && GHL_LOCATION_ID);
}

function formatFlightRow(f: FlightOption, index: number): string {
  const airline = [...new Set(f.segments.map((s) => s.airline))].join(' + ');
  const route = `${f.segments[0].departure.airport} → ${f.segments[f.segments.length - 1].arrival.airport}`;
  const times = `${f.segments[0].departure.time} – ${f.segments[f.segments.length - 1].arrival.time}`;
  const stops = f.stops === 0 ? 'Direct' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`;
  const duration = formatDuration(f.totalDuration);
  const date = f.segments[0].departure.date;

  return `
    <tr style="border-bottom: 1px solid #F5F0E8;">
      <td style="padding: 12px 8px; font-family: sans-serif; font-size: 14px; color: #1A3C34;">
        <strong>${index + 1}. ${airline}</strong><br/>
        <span style="font-size: 12px; color: #666;">${route} · ${times}</span><br/>
        <span style="font-size: 12px; color: #666;">${duration} · ${stops} · ${date}</span>
      </td>
      <td style="padding: 12px 8px; text-align: right; font-family: sans-serif; font-size: 18px; font-weight: bold; color: #E8836B;">
        $${f.price}
      </td>
    </tr>`;
}

function buildEmailHtml(
  firstName: string,
  retreatName: string,
  departingFlights: FlightOption[],
  returnFlights: FlightOption[],
): string {
  const departingRows = departingFlights.map((f, i) => formatFlightRow(f, i)).join('');
  const returnRows = returnFlights.map((f, i) => formatFlightRow(f, i)).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #FAFAF5; font-family: sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
    <!-- Header -->
    <div style="background: #1A3C34; padding: 32px 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0;">Your Flight Plans</h1>
      <p style="color: #B8D4E3; font-size: 14px; margin: 0;">${retreatName}</p>
    </div>

    <div style="padding: 24px;">
      <p style="font-size: 16px; color: #1A3C34; margin: 0 0 20px 0;">Hey ${firstName}!</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 24px 0;">Here are the flight options you saved. Prices can change fast — we recommend booking soon if you see one you like.</p>

      ${departingFlights.length > 0 ? `
      <h2 style="font-size: 14px; color: #E8836B; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Departing Flights</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${departingRows}
      </table>
      ` : ''}

      ${returnFlights.length > 0 ? `
      <h2 style="font-size: 14px; color: #E8836B; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Return Flights</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${returnRows}
      </table>
      ` : ''}

      <!-- CTA -->
      <div style="text-align: center; padding: 24px 0;">
        <a href="https://explore.getsaltyretreats.com/flights" style="display: inline-block; background: #E8836B; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px;">Search More Flights</a>
      </div>

      <div style="background: #F5F0E8; border-radius: 8px; padding: 16px; margin-top: 16px;">
        <p style="font-size: 12px; color: #666; margin: 0;">Questions? Reply to this email or reach out on WhatsApp and we'll help you lock in your flights.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #F5F0E8; padding: 16px 24px; text-align: center;">
      <p style="font-size: 12px; color: #999; margin: 0;">SALTY Retreats · getsaltyretreats.com</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadData, departingFlights, returnFlights, retreatName } = body;

    if (!leadData?.email || !retreatName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (isV2Configured()) {
      try {
        // Step 1: Find contact by email
        const searchRes = await fetch(
          `${GHL_V2_BASE}/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(leadData.email)}`,
          {
            headers: {
              Authorization: `Bearer ${GHL_V2_TOKEN}`,
              Version: '2021-07-28',
            },
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchData: any = await searchRes.json();
        const contactId = searchData?.contact?.id;

        if (!contactId) {
          console.warn('[GHL V2] Contact not found for', leadData.email, '— falling back to mailto');
          return NextResponse.json({ success: false, fallback: 'mailto' });
        }

        // Step 2: Send email via Conversations API
        const emailHtml = buildEmailHtml(
          leadData.firstName || 'there',
          retreatName,
          departingFlights || [],
          returnFlights || [],
        );

        const sendRes = await fetch(`${GHL_V2_BASE}/conversations/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GHL_V2_TOKEN}`,
            'Content-Type': 'application/json',
            Version: '2021-07-28',
          },
          body: JSON.stringify({
            type: 'Email',
            contactId,
            subject: `Your flight plans for ${retreatName}`,
            html: emailHtml,
            emailFrom: GHL_FROM_EMAIL,
          }),
        });

        if (sendRes.ok) {
          console.log('[GHL V2] Email sent successfully to', leadData.email);
          return NextResponse.json({ success: true, method: 'ghl_v2' });
        }

        console.error('[GHL V2] Send failed:', sendRes.status, await sendRes.text());
        return NextResponse.json({ success: false, fallback: 'mailto' });
      } catch (error) {
        console.error('[GHL V2] Error:', error);
        return NextResponse.json({ success: false, fallback: 'mailto' });
      }
    }

    // GHL not configured — log and signal fallback
    console.log('[Send Flights] GHL V2 not configured, client should use mailto: fallback');
    console.log('[Send Flights] Payload:', {
      to: leadData.email,
      retreatName,
      departingCount: (departingFlights as FlightOption[])?.length || 0,
      returnCount: (returnFlights as FlightOption[])?.length || 0,
    });

    return NextResponse.json({ success: false, fallback: 'mailto' });
  } catch (error) {
    console.error('Send flights error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
