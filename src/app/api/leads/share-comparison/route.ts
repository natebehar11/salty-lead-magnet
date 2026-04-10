import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateContact, moveToStage, addContactTags } from '@/lib/ghl';

/**
 * Share DIY comparison with friends ("Convince Your Crew").
 *
 * 1. Captures sender as a compare lead in GHL
 * 2. Captures each friend as a referral lead
 * 3. Triggers email to friend(s) with personalized comparison link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderName, senderEmail, friendEmails, retreatSlug, savingsAmount, savingsPercent } = body;

    if (!senderName || !senderEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: senderName, senderEmail' },
        { status: 400 }
      );
    }

    if (!friendEmails || !Array.isArray(friendEmails) || friendEmails.length === 0) {
      return NextResponse.json(
        { error: 'At least one friend email is required' },
        { status: 400 }
      );
    }

    // Validate friend emails (max 3)
    const validFriendEmails = friendEmails
      .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      .slice(0, 3);

    if (validFriendEmails.length === 0) {
      return NextResponse.json(
        { error: 'No valid friend email addresses provided' },
        { status: 400 }
      );
    }

    // 1. Capture sender as compare lead
    const senderTags = [
      'compare_lead',
      'source_salty_explorer',
      'shared_comparison',
      `shared_with_${validFriendEmails.length}_friends`,
    ];
    if (retreatSlug) {
      senderTags.push(`compare_retreat_${retreatSlug}`);
    }

    const senderContactId = await createOrUpdateContact({
      firstName: senderName,
      email: senderEmail,
      phone: '',
      tags: senderTags,
      source: 'salty-explorer-compare',
      customFields: {
        compare_shared_at: new Date().toISOString(),
        compare_friends_count: String(validFriendEmails.length),
        compare_savings_shown: savingsAmount ? `$${savingsAmount}` : '',
      },
    });

    // Move sender to exploring stage (high engagement)
    await moveToStage(senderContactId, 'exploring');

    // 2. Capture each friend as a referral lead
    const friendContactIds: string[] = [];
    for (const friendEmail of validFriendEmails) {
      const friendTags = [
        'referral_lead',
        'source_salty_explorer',
        `referred_by_${senderEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        'compare_referral',
      ];
      if (retreatSlug) {
        friendTags.push(`compare_retreat_${retreatSlug}`);
      }

      const friendContactId = await createOrUpdateContact({
        firstName: `Friend of ${senderName}`,
        email: friendEmail,
        phone: '',
        tags: friendTags,
        source: 'salty-explorer-referral',
        customFields: {
          referred_by_name: senderName,
          referred_by_email: senderEmail,
          referral_date: new Date().toISOString(),
          referral_source: 'compare-page',
        },
      });

      friendContactIds.push(friendContactId);
    }

    // Tag sender with friend count for follow-up automation
    await addContactTags(senderContactId, [`crew_size_${validFriendEmails.length}`]);

    // 3. Log the email that would be sent (GHL automation handles actual sending)
    console.log('[Share Comparison] Emails to send:', {
      from: { name: senderName, email: senderEmail },
      to: validFriendEmails,
      retreatSlug,
      savingsAmount,
      savingsPercent,
      compareUrl: `https://explore.getsaltyretreats.com/compare${retreatSlug ? `#${retreatSlug}` : ''}`,
    });

    return NextResponse.json({
      success: true,
      senderContactId,
      friendContactIds,
      friendCount: validFriendEmails.length,
    });
  } catch (error) {
    console.error('Share comparison error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
