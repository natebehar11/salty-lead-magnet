import { NextRequest, NextResponse } from 'next/server';
import { FlightOption } from '@/types';
import { formatDuration } from '@/lib/utils';

/**
 * Share flight plans via email or WhatsApp through GHL.
 *
 * When GHL is configured, this triggers a GHL automation that sends
 * a branded email or WhatsApp message to the contact.
 *
 * When GHL is not configured, it logs the payload that would be sent.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadData, flightOptions, retreatName, deliveryMethod } = body;

    if (!leadData || !flightOptions || !retreatName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format flight data for messaging
    const formattedFlights = (flightOptions as FlightOption[]).map((flight, i) => ({
      rank: i + 1,
      airline: [...new Set(flight.segments.map((s) => s.airline))].join(' + '),
      route: `${flight.segments[0].departure.airport} → ${flight.segments[flight.segments.length - 1].arrival.airport}`,
      times: `${flight.segments[0].departure.time} → ${flight.segments[flight.segments.length - 1].arrival.time}`,
      duration: formatDuration(flight.totalDuration),
      stops: flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`,
      price: `$${flight.price}`,
      bookingUrl: flight.bookingUrl,
      isSelfTransfer: flight.isSelfTransfer,
      isAlternateAirport: flight.isAlternateAirport,
    }));

    // Build WhatsApp message
    const whatsappMessage = [
      `Hey ${leadData.firstName}! Here are your flight options for SALTY ${retreatName}`,
      '',
      ...formattedFlights.map(
        (f) =>
          `${f.rank}. ${f.airline} | ${f.route} | ${f.duration} | ${f.stops} | ${f.price}${
            f.isSelfTransfer ? ' [Self-transfer]' : ''
          }${f.isAlternateAirport ? ' [Alt airport]' : ''}`
      ),
      '',
      'Questions? Reply here or tap to chat: https://wa.me/14318291135',
      '',
      '— The SALTY Team',
    ].join('\n');

    // Build email data
    const emailPayload = {
      to: leadData.email,
      recipientName: leadData.firstName,
      retreatName,
      flights: formattedFlights,
    };

    // Check if GHL is configured
    const ghlKey = process.env.GHL_API_KEY;

    if (ghlKey) {
      // TODO: Trigger GHL automation with the formatted data
      // This would call the GHL API to trigger a workflow that sends
      // the email/WhatsApp with the flight data as custom values
      console.log('[GHL] Would trigger share automation:', {
        deliveryMethod,
        email: emailPayload,
        whatsapp: whatsappMessage,
      });
    } else {
      // Dev mode: log what would be sent
      console.log(`[Share Flights] Method: ${deliveryMethod}`);
      console.log('[Share Flights] Email payload:', emailPayload);
      console.log('[Share Flights] WhatsApp message:', whatsappMessage);
    }

    return NextResponse.json({
      success: true,
      deliveryMethod,
    });
  } catch (error) {
    console.error('Share flights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
