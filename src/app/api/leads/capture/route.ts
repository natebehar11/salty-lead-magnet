import { NextRequest, NextResponse } from 'next/server';
import {
  createOrUpdateContact,
  generateQuizTags,
  generateQuizCustomFields,
  generateFlightTags,
  moveToStage,
  addContactTags,
  generateIntentTags,
} from '@/lib/ghl';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      email,
      whatsappNumber,
      source,
      quizAnswers,
      topMatch,
      matchScore,
      flightSearch,
      intentAction,
      intentDetails,
    } = body;

    if (!firstName || !email || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, email, whatsappNumber' },
        { status: 400 }
      );
    }

    // Generate tags based on source
    let tags: string[] = [];
    let customFields: Record<string, string> = {};

    if (source === 'quiz' && quizAnswers) {
      tags = generateQuizTags(quizAnswers, topMatch, matchScore);
      customFields = generateQuizCustomFields(quizAnswers, topMatch, matchScore);
    } else if (source === 'flights' && flightSearch) {
      tags = generateFlightTags(flightSearch.originCode, flightSearch.retreatSlug);
    } else if (source === 'planner') {
      tags = ['planner_lead', 'source_salty_explorer'];
      if (body.retreatSlug) {
        tags.push(`planner_retreat_${body.retreatSlug}`);
      }
      if (body.citiesCount) {
        tags.push(`planner_cities_${body.citiesCount}`);
      }
      customFields = {
        planner_completed_at: new Date().toISOString(),
        planner_source: 'salty-explorer',
      };
      if (body.retreatSlug) {
        customFields.planner_retreat = body.retreatSlug;
      }
    }

    // Add intent tags if present
    if (intentAction) {
      tags = [...tags, ...generateIntentTags(intentAction, intentDetails)];
    }

    // Create or update contact in GHL
    const contactId = await createOrUpdateContact({
      firstName,
      email,
      phone: whatsappNumber,
      tags,
      source: `salty-explorer-${source}`,
      customFields,
    });

    // Place in pipeline based on source
    if (source === 'quiz') {
      await moveToStage(contactId, 'quizLead');
    } else if (source === 'flights') {
      await moveToStage(contactId, 'exploring');
    } else if (source === 'planner') {
      await moveToStage(contactId, 'highIntent');
    }

    console.log(`[Lead Captured] ${firstName} (${email}) via ${source}`, {
      contactId,
      tags: tags.length,
      stage: source === 'quiz' ? 'quizLead' : 'exploring',
    });

    return NextResponse.json({
      success: true,
      contactId,
    });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update contact stage or add tags for existing leads.
 * Used for high-intent actions: favourite flights, share plans, compare page visits.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, action, stage, details } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: 'Missing contactId' },
        { status: 400 }
      );
    }

    if (action) {
      const intentTags = generateIntentTags(action, details);
      await addContactTags(contactId, intentTags);
    }

    if (stage) {
      await moveToStage(contactId, stage);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
