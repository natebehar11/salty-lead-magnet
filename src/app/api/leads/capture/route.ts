import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createOrUpdateContact,
  generateQuizTags,
  generateQuizCustomFields,
  generateFlightTags,
  moveToStage,
  addContactTags,
  generateIntentTags,
} from '@/lib/ghl';

const leadCapturePostSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  whatsappNumber: z.string().optional(),
  source: z.enum(['quiz', 'flights', 'planner', 'planner-v2', 'planner-v2-share', 'planner-v2-email', 'compare']).optional(),
  quizAnswers: z.record(z.unknown()).optional(),
  topMatch: z.string().optional(),
  matchScore: z.number().optional(),
  flightSearch: z.object({ originCode: z.string(), retreatSlug: z.string().optional() }).optional(),
  retreatSlug: z.string().optional(),
  citiesCount: z.number().optional(),
  boardItemCount: z.number().optional(),
  boardCityCount: z.number().optional(),
  intentAction: z.string().optional(),
  intentDetails: z.record(z.string()).optional(),
});

const leadCapturePatchSchema = z.object({
  contactId: z.string().min(1),
  action: z.string().optional(),
  stage: z.enum(['quizLead', 'exploring', 'highIntent', 'booked']).optional(),
  details: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = leadCapturePostSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      firstName,
      email,
      whatsappNumber,
      source,
      quizAnswers,
      topMatch,
      matchScore,
      flightSearch,
      retreatSlug,
      citiesCount,
      boardItemCount,
      boardCityCount,
      intentAction,
      intentDetails,
    } = parsed.data;

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
      if (retreatSlug) {
        tags.push(`planner_retreat_${retreatSlug}`);
      }
      if (citiesCount) {
        tags.push(`planner_cities_${citiesCount}`);
      }
      customFields = {
        planner_completed_at: new Date().toISOString(),
        planner_source: 'salty-explorer',
      };
      if (retreatSlug) {
        customFields.planner_retreat = retreatSlug;
      }
    } else if (source === 'planner-v2' || source === 'planner-v2-share' || source === 'planner-v2-email') {
      tags = ['planner_v2_lead', 'source_salty_explorer'];
      if (source === 'planner-v2-share') tags.push('planner_v2_share');
      if (source === 'planner-v2-email') tags.push('planner_v2_email');
      if (retreatSlug) {
        tags.push(`planner_retreat_${retreatSlug}`);
      }
      if (boardItemCount) {
        tags.push(`vision_board_items_${boardItemCount}`);
      }
      if (boardCityCount) {
        tags.push(`vision_board_cities_${boardCityCount}`);
      }
      customFields = {
        planner_completed_at: new Date().toISOString(),
        planner_source: 'vision-board-v2',
      };
      if (retreatSlug) {
        customFields.planner_retreat = retreatSlug;
      }
    } else if (source === 'compare') {
      tags = ['compare_lead', 'source_salty_explorer'];
      customFields = {
        compare_viewed_at: new Date().toISOString(),
      };
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
      source: source ? `salty-explorer-${source}` : 'salty-explorer',
      customFields,
    });

    // Place in pipeline based on source
    if (source === 'quiz') {
      await moveToStage(contactId, 'quizLead');
    } else if (source === 'flights') {
      await moveToStage(contactId, 'exploring');
    } else if (source === 'planner' || source?.startsWith('planner-v2')) {
      await moveToStage(contactId, 'highIntent');
    } else if (source === 'compare') {
      await moveToStage(contactId, 'exploring');
    }

    console.log(`[Lead Captured] ${firstName} (${email}) via ${source || 'unknown'}`, {
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
    const rawBody = await request.json();
    const parsed = leadCapturePatchSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { contactId, action, stage, details } = parsed.data;

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
