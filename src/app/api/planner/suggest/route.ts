import { NextRequest, NextResponse } from 'next/server';
import { SuggestedCity } from '@/types/planner';

interface SuggestionResponse {
  cities: SuggestedCity[];
  totalDays: number;
  reasoning: string;
}

const FALLBACK_SUGGESTIONS: Record<string, SuggestionResponse> = {
  'Costa Rica': {
    cities: [
      {
        id: 'fallback-cr-1',
        name: 'San Jose',
        country: 'Costa Rica',
        days: 2,
        description: 'The vibrant capital is your gateway to Costa Rica with incredible markets, coffee culture, and a thriving food scene.',
        activities: [
          { name: 'Mercado Central', category: 'landmark', description: 'Bustling central market with local food stalls and fresh produce.', link: 'https://www.google.com/maps/search/Mercado+Central+San+Jose+Costa+Rica' },
          { name: 'National Museum of Costa Rica', category: 'landmark', description: 'Former military fortress turned museum with butterfly garden.', link: 'https://www.google.com/maps/search/National+Museum+Costa+Rica' },
          { name: 'Doka Estate Coffee Tour', category: 'hidden-gem', description: 'Award-winning coffee plantation in the highlands with tastings.', link: 'https://www.google.com/maps/search/Doka+Estate+Coffee+Tour' },
          { name: 'CrossFit Quepos', category: 'fitness', description: 'Well-equipped box popular with travelers near the coast.', link: 'https://www.google.com/maps/search/CrossFit+Quepos+Costa+Rica' },
          { name: 'Restaurante Silvestre', category: 'restaurant', description: 'Farm-to-table dining highlighting Costa Rican ingredients.', link: 'https://www.google.com/maps/search/Restaurante+Silvestre+San+Jose', priceRange: '$$' },
          { name: 'Barrio Escalante', category: 'neighborhood', description: 'Trendy foodie neighborhood with craft breweries and galleries.', link: 'https://www.google.com/maps/search/Barrio+Escalante+San+Jose' },
        ],
        highlights: ['Central Market', 'National Museum', 'Coffee plantation tour'],
      },
      {
        id: 'fallback-cr-2',
        name: 'Arenal',
        country: 'Costa Rica',
        days: 3,
        description: 'Adventure hub dominated by the iconic volcano with world-class hot springs, hiking, and wildlife.',
        activities: [
          { name: 'Arenal Volcano National Park', category: 'outdoor', description: 'Hike lava trails with panoramic volcano views.', link: 'https://www.google.com/maps/search/Arenal+Volcano+National+Park' },
          { name: 'Tabacon Hot Springs', category: 'landmark', description: 'Natural thermal rivers flowing from the volcano into jungle pools.', link: 'https://www.google.com/maps/search/Tabacon+Hot+Springs+Arenal' },
          { name: 'Mistico Hanging Bridges', category: 'outdoor', description: 'Walk through the rainforest canopy on suspension bridges.', link: 'https://www.google.com/maps/search/Mistico+Hanging+Bridges+Arenal' },
          { name: 'Arenal Fitness Center', category: 'fitness', description: 'Local gym with weights and cardio near La Fortuna town center.', link: 'https://www.google.com/maps/search/gym+La+Fortuna+Arenal' },
          { name: 'Don Rufino', category: 'restaurant', description: 'Upscale Costa Rican cuisine in the heart of La Fortuna.', link: 'https://www.google.com/maps/search/Don+Rufino+La+Fortuna', priceRange: '$$' },
          { name: 'El Salto Swimming Hole', category: 'hidden-gem', description: 'Secret local swimming spot with a rope swing under a waterfall.', link: 'https://www.google.com/maps/search/El+Salto+Swimming+Hole+La+Fortuna' },
        ],
        highlights: ['Volcano hike', 'Hot springs', 'Hanging bridges'],
      },
    ],
    totalDays: 5,
    reasoning: 'Since your retreat is on the Pacific coast, we recommend exploring the central highlands and Arenal volcano region beforehand.',
  },
  'Sri Lanka': {
    cities: [
      {
        id: 'fallback-sl-1',
        name: 'Colombo',
        country: 'Sri Lanka',
        days: 2,
        description: 'A buzzing coastal capital blending colonial heritage, vibrant markets, and an emerging food scene.',
        activities: [
          { name: 'Gangaramaya Temple', category: 'landmark', description: 'Eclectic Buddhist temple with a museum and serene lake views.', link: 'https://www.google.com/maps/search/Gangaramaya+Temple+Colombo' },
          { name: 'Pettah Market', category: 'neighborhood', description: 'Chaotic and colorful market district for spices, textiles, and street food.', link: 'https://www.google.com/maps/search/Pettah+Market+Colombo' },
          { name: 'Galle Face Green', category: 'outdoor', description: 'Ocean-side promenade perfect for sunset walks and street food stalls.', link: 'https://www.google.com/maps/search/Galle+Face+Green+Colombo' },
          { name: 'CrossFit Colombo', category: 'fitness', description: 'Top-rated CrossFit box in the city with drop-in sessions.', link: 'https://www.google.com/maps/search/CrossFit+Colombo' },
          { name: 'Ministry of Crab', category: 'restaurant', description: 'World-famous crab restaurant in the historic Dutch Hospital.', link: 'https://www.google.com/maps/search/Ministry+of+Crab+Colombo', priceRange: '$$$' },
          { name: 'Barefoot Gallery', category: 'hidden-gem', description: 'Art gallery and bookshop in a beautiful garden courtyard.', link: 'https://www.google.com/maps/search/Barefoot+Gallery+Colombo' },
        ],
        highlights: ['Gangaramaya Temple', 'Pettah Market', 'Galle Face Green'],
      },
      {
        id: 'fallback-sl-2',
        name: 'Sigiriya',
        country: 'Sri Lanka',
        days: 2,
        description: 'The cultural heart of Sri Lanka with ancient rock fortresses, cave temples, and incredible wildlife safaris.',
        activities: [
          { name: 'Sigiriya Lion Rock', category: 'landmark', description: 'Climb the iconic 5th-century rock fortress with panoramic views.', link: 'https://www.google.com/maps/search/Sigiriya+Lion+Rock' },
          { name: 'Dambulla Cave Temple', category: 'landmark', description: 'UNESCO World Heritage cave complex with stunning Buddhist murals.', link: 'https://www.google.com/maps/search/Dambulla+Cave+Temple' },
          { name: 'Minneriya National Park Safari', category: 'outdoor', description: 'Famous for "The Gathering" — hundreds of wild elephants at the reservoir.', link: 'https://www.google.com/maps/search/Minneriya+National+Park' },
          { name: 'Pidurangala Rock', category: 'hidden-gem', description: 'Quieter alternative to Sigiriya with even better sunrise views.', link: 'https://www.google.com/maps/search/Pidurangala+Rock' },
          { name: 'Hotel & Gym Sigiriya', category: 'fitness', description: 'Hotel fitness center open to visitors near the rock fortress.', link: 'https://www.google.com/maps/search/gym+Sigiriya+Sri+Lanka' },
          { name: 'Inamaluwa Village Kitchen', category: 'restaurant', description: 'Authentic Sri Lankan rice and curry in a village setting.', link: 'https://www.google.com/maps/search/restaurant+Sigiriya+Sri+Lanka', priceRange: '$' },
        ],
        highlights: ['Lion Rock fortress', 'Dambulla Cave Temple', 'Safari in Minneriya'],
      },
    ],
    totalDays: 4,
    reasoning: 'Arrive a few days early to explore the cultural triangle before heading south to the coast.',
  },
  'Morocco': {
    cities: [
      {
        id: 'fallback-ma-1',
        name: 'Marrakech',
        country: 'Morocco',
        days: 3,
        description: 'Sensory overload in the best way — colorful souks, rooftop dining, and ancient palaces around every corner.',
        activities: [
          { name: 'Jemaa el-Fnaa', category: 'landmark', description: 'The legendary main square that transforms from market by day to open-air food court by night.', link: 'https://www.google.com/maps/search/Jemaa+el+Fnaa+Marrakech' },
          { name: 'Majorelle Garden', category: 'landmark', description: 'Stunning blue-walled botanical garden once owned by Yves Saint Laurent.', link: 'https://www.google.com/maps/search/Majorelle+Garden+Marrakech' },
          { name: 'Medina Souks', category: 'neighborhood', description: 'Get wonderfully lost in winding alleyways full of leather, spices, and lanterns.', link: 'https://www.google.com/maps/search/Medina+Souks+Marrakech' },
          { name: 'Hammam de la Rose', category: 'hidden-gem', description: 'Traditional Moroccan bathhouse experience with massage and scrub.', link: 'https://www.google.com/maps/search/Hammam+de+la+Rose+Marrakech' },
          { name: 'CrossFit Marrakech', category: 'fitness', description: 'Modern CrossFit facility with English-speaking coaches.', link: 'https://www.google.com/maps/search/CrossFit+Marrakech' },
          { name: 'Nomad Restaurant', category: 'restaurant', description: 'Modern Moroccan rooftop dining overlooking the spice market.', link: 'https://www.google.com/maps/search/Nomad+Restaurant+Marrakech', priceRange: '$$' },
        ],
        highlights: ['Jemaa el-Fnaa', 'Majorelle Garden', 'Medina shopping', 'Hammam spa'],
      },
      {
        id: 'fallback-ma-2',
        name: 'Essaouira',
        country: 'Morocco',
        days: 2,
        description: 'Laid-back coastal town with incredible wind, fresh seafood, and a bohemian art scene.',
        activities: [
          { name: 'Essaouira Port', category: 'landmark', description: 'Photogenic blue fishing port where fresh catches come in daily.', link: 'https://www.google.com/maps/search/Essaouira+Port+Morocco' },
          { name: 'Beach Windsurfing', category: 'outdoor', description: 'World-class windsurfing and kitesurfing on the Atlantic coast.', link: 'https://www.google.com/maps/search/windsurfing+Essaouira' },
          { name: 'Seafood Market Grills', category: 'restaurant', description: 'Pick your fresh fish at the market and have it grilled on the spot.', link: 'https://www.google.com/maps/search/seafood+market+Essaouira', priceRange: '$' },
          { name: 'Essaouira Medina', category: 'neighborhood', description: 'UNESCO-listed walled medina with art galleries and artisan workshops.', link: 'https://www.google.com/maps/search/Essaouira+Medina' },
          { name: 'Ocean Fitness Essaouira', category: 'fitness', description: 'Beach-front gym with ocean views and functional training equipment.', link: 'https://www.google.com/maps/search/gym+Essaouira+Morocco' },
          { name: 'Sidi Kaouki Beach', category: 'hidden-gem', description: 'Quiet fishing village south of town with camel rides on empty beaches.', link: 'https://www.google.com/maps/search/Sidi+Kaouki+Beach' },
        ],
        highlights: ['Blue fishing port', 'Windsurfing', 'Fresh seafood market'],
      },
    ],
    totalDays: 5,
    reasoning: 'Start in Marrakech for the ultimate sensory experience, then wind down in coastal Essaouira before your surf retreat.',
  },
  'Sicily': {
    cities: [
      {
        id: 'fallback-si-1',
        name: 'Palermo',
        country: 'Italy',
        days: 3,
        description: 'Sicily\'s chaotic, beautiful capital where Arab-Norman architecture meets the best street food in Europe.',
        activities: [
          { name: 'Ballarò Street Food Tour', category: 'landmark', description: 'Historic market with arancini, panelle, and sfincione from street vendors.', link: 'https://www.google.com/maps/search/Ballaro+Market+Palermo' },
          { name: 'Palermo Cathedral', category: 'landmark', description: 'Stunning mix of architectural styles spanning 800 years of Sicilian history.', link: 'https://www.google.com/maps/search/Palermo+Cathedral' },
          { name: 'Monreale Mosaics', category: 'hidden-gem', description: 'Byzantine gold mosaics covering 6,000 sq meters — absolutely jaw-dropping.', link: 'https://www.google.com/maps/search/Monreale+Cathedral+Sicily' },
          { name: 'Teatro Massimo', category: 'landmark', description: 'Italy\'s largest opera house with rooftop tours and evening performances.', link: 'https://www.google.com/maps/search/Teatro+Massimo+Palermo' },
          { name: 'Palermo Fitness Club', category: 'fitness', description: 'Modern gym with free weights and group classes in the city center.', link: 'https://www.google.com/maps/search/gym+Palermo+Sicily' },
          { name: 'Trattoria Ai Cascinari', category: 'restaurant', description: 'No-frills trattoria beloved by locals for pasta alla Norma and fresh fish.', link: 'https://www.google.com/maps/search/Trattoria+Ai+Cascinari+Palermo', priceRange: '$' },
        ],
        highlights: ['Street food tour', 'Cathedral', 'Monreale mosaics', 'Opera'],
      },
      {
        id: 'fallback-si-2',
        name: 'Catania',
        country: 'Italy',
        days: 2,
        description: 'Gritty, volcanic, and utterly charming — Catania sits at the foot of Mt Etna with incredible baroque architecture.',
        activities: [
          { name: 'La Pescheria Fish Market', category: 'landmark', description: 'Chaotic, colorful outdoor fish market that\'s been running for centuries.', link: 'https://www.google.com/maps/search/La+Pescheria+Catania' },
          { name: 'Via Etnea', category: 'neighborhood', description: 'Main shopping boulevard with views of Mt Etna at the end of every block.', link: 'https://www.google.com/maps/search/Via+Etnea+Catania' },
          { name: 'Mt Etna Day Trip', category: 'outdoor', description: 'Europe\'s most active volcano — hike the craters or take the cable car up.', link: 'https://www.google.com/maps/search/Mount+Etna+Sicily' },
          { name: 'CrossFit Catania', category: 'fitness', description: 'Top-rated box near the city center with welcoming drop-in culture.', link: 'https://www.google.com/maps/search/CrossFit+Catania' },
          { name: 'Trattoria do Fiore', category: 'restaurant', description: 'Traditional Sicilian seafood with the freshest catch from La Pescheria.', link: 'https://www.google.com/maps/search/Trattoria+do+Fiore+Catania', priceRange: '$$' },
          { name: 'Monastero dei Benedettini', category: 'hidden-gem', description: 'Massive Benedictine monastery with underground Roman ruins beneath.', link: 'https://www.google.com/maps/search/Monastero+dei+Benedettini+Catania' },
        ],
        highlights: ['Fish market', 'Baroque architecture', 'Mt Etna day trip'],
      },
    ],
    totalDays: 5,
    reasoning: 'Explore western Sicily first for incredible food and architecture, then make your way east near your retreat location.',
  },
  'El Salvador': {
    cities: [
      {
        id: 'fallback-es-1',
        name: 'San Salvador',
        country: 'El Salvador',
        days: 2,
        description: 'The compact capital has volcanic hikes, craft markets, and a growing food and coffee scene.',
        activities: [
          { name: 'National Palace', category: 'landmark', description: 'Ornate government palace with guided tours and beautiful architecture.', link: 'https://www.google.com/maps/search/National+Palace+San+Salvador' },
          { name: 'El Boqueron Volcano', category: 'outdoor', description: 'Hike the rim of this dormant crater just 20 minutes from downtown.', link: 'https://www.google.com/maps/search/El+Boqueron+Volcano+San+Salvador' },
          { name: 'Mercado Ex-Cuartel', category: 'neighborhood', description: 'Artisan craft market in a converted military barracks.', link: 'https://www.google.com/maps/search/Mercado+Ex+Cuartel+San+Salvador' },
          { name: 'San Salvador Fitness Hub', category: 'fitness', description: 'Modern gym with CrossFit classes and personal training.', link: 'https://www.google.com/maps/search/gym+San+Salvador' },
          { name: 'Café San Rafael', category: 'restaurant', description: 'Local Salvadoran coffee roaster and café with incredible pupusas.', link: 'https://www.google.com/maps/search/cafe+San+Salvador+El+Salvador', priceRange: '$' },
          { name: 'Iglesia El Rosario', category: 'hidden-gem', description: 'Brutalist church with rainbow light displays from abstract stained glass.', link: 'https://www.google.com/maps/search/Iglesia+El+Rosario+San+Salvador' },
        ],
        highlights: ['National Palace', 'El Boqueron volcano', 'Craft markets'],
      },
      {
        id: 'fallback-es-2',
        name: 'Ruta de las Flores',
        country: 'El Salvador',
        days: 2,
        description: 'A scenic mountain route through colonial villages, coffee farms, and waterfalls.',
        activities: [
          { name: 'Juayúa Food Festival', category: 'landmark', description: 'Famous weekend food fair with Salvadoran street food and live music.', link: 'https://www.google.com/maps/search/Juayua+Food+Festival+El+Salvador' },
          { name: 'Finca El Carmen Coffee Tour', category: 'hidden-gem', description: 'Organic coffee farm tour with bean-to-cup tasting experience.', link: 'https://www.google.com/maps/search/coffee+farm+Ruta+de+las+Flores' },
          { name: 'Cascadas de Don Juan', category: 'outdoor', description: 'Series of seven waterfalls with natural swimming pools and rope swings.', link: 'https://www.google.com/maps/search/Cascadas+de+Don+Juan+El+Salvador' },
          { name: 'Ataco Village', category: 'neighborhood', description: 'Colorful colonial village famous for murals, textiles, and weekend markets.', link: 'https://www.google.com/maps/search/Ataco+El+Salvador' },
          { name: 'Mountain Trail Running', category: 'fitness', description: 'Beautiful highland trails through coffee plantations and cloud forest.', link: 'https://www.google.com/maps/search/hiking+Ruta+de+las+Flores' },
          { name: 'R&R Restaurante Ataco', category: 'restaurant', description: 'Charming courtyard restaurant with creative Salvadoran-fusion dishes.', link: 'https://www.google.com/maps/search/restaurant+Ataco+El+Salvador', priceRange: '$$' },
        ],
        highlights: ['Coffee farms', 'Waterfalls', 'Colonial villages'],
      },
    ],
    totalDays: 4,
    reasoning: 'Start in the capital for a city vibe, then road trip the Ruta de las Flores before hitting the coast for your surf retreat.',
  },
  'Panama': {
    cities: [
      {
        id: 'fallback-pa-1',
        name: 'Panama City',
        country: 'Panama',
        days: 3,
        description: 'Where a Manhattan-like skyline meets colonial old town — world-class dining, nightlife, and the famous canal.',
        activities: [
          { name: 'Panama Canal Miraflores Locks', category: 'landmark', description: 'Watch massive ships transit the canal from the viewing platform and museum.', link: 'https://www.google.com/maps/search/Miraflores+Locks+Panama+Canal' },
          { name: 'Casco Viejo', category: 'neighborhood', description: 'UNESCO old town with rooftop bars, boutique hotels, and vibrant plazas.', link: 'https://www.google.com/maps/search/Casco+Viejo+Panama+City' },
          { name: 'Biomuseo', category: 'landmark', description: 'Frank Gehry-designed biodiversity museum — stunning architecture and exhibits.', link: 'https://www.google.com/maps/search/Biomuseo+Panama+City' },
          { name: 'CityGym Panama', category: 'fitness', description: 'Premium fitness facility with pool, weights, and group classes.', link: 'https://www.google.com/maps/search/gym+Panama+City' },
          { name: 'Donde José', category: 'restaurant', description: 'Chef\'s table experience in Casco Viejo showcasing Panamanian ingredients.', link: 'https://www.google.com/maps/search/Donde+Jose+Panama+City', priceRange: '$$$' },
          { name: 'Mercado de Mariscos', category: 'hidden-gem', description: 'Waterfront fish market with an upstairs cevichería — best seafood in the city.', link: 'https://www.google.com/maps/search/Mercado+de+Mariscos+Panama+City' },
        ],
        highlights: ['Panama Canal', 'Casco Viejo', 'Biomuseo', 'Rooftop bars'],
      },
      {
        id: 'fallback-pa-2',
        name: 'Boquete',
        country: 'Panama',
        days: 2,
        description: 'Cool highland town surrounded by cloud forest, coffee plantations, and incredible hiking.',
        activities: [
          { name: 'Volcán Barú Trail', category: 'outdoor', description: 'Hike to Panama\'s highest point for sunrise views of both oceans.', link: 'https://www.google.com/maps/search/Volcan+Baru+Trail+Boquete' },
          { name: 'Geisha Coffee Tour', category: 'hidden-gem', description: 'Taste the world\'s most expensive coffee variety grown right here.', link: 'https://www.google.com/maps/search/Geisha+Coffee+Tour+Boquete' },
          { name: 'Lost Waterfalls Trail', category: 'outdoor', description: 'Scenic jungle hike to three hidden waterfalls in the cloud forest.', link: 'https://www.google.com/maps/search/Lost+Waterfalls+Boquete' },
          { name: 'Boquete Fitness Center', category: 'fitness', description: 'Small but well-equipped gym popular with expats and travelers.', link: 'https://www.google.com/maps/search/gym+Boquete+Panama' },
          { name: 'Retrogusto Ristorante', category: 'restaurant', description: 'Italian-Panamanian fusion in a cozy mountain setting.', link: 'https://www.google.com/maps/search/Retrogusto+Boquete+Panama', priceRange: '$$' },
          { name: 'Tuesday Market', category: 'neighborhood', description: 'Weekly farmers market with local produce, crafts, and live music.', link: 'https://www.google.com/maps/search/Tuesday+Market+Boquete+Panama' },
        ],
        highlights: ['Cloud forest hike', 'Coffee tour', 'Hot springs'],
      },
    ],
    totalDays: 5,
    reasoning: 'Panama City is world-class skyline meets colonial charm. Then head to Boquete for coffee and cloud forests.',
  },
};

const SUGGEST_SYSTEM_PROMPT = `You are a travel planning assistant for SALTY Retreats, a Canadian fitness and adventure retreat company. You help travelers plan multi-city itineraries before and after their retreats.

Your suggestions should be:
- Logistically practical (easy connections from the retreat destination)
- Specific and actionable (real place names, not generic categories)
- Enthusiastic and on-brand (adventurous, fitness-minded, culturally curious)
- Varied (mix of activities, food, fitness, culture, hidden gems)

RESPONSE FORMAT: Return valid JSON matching this structure:
{
  "cities": [
    {
      "name": "City Name",
      "country": "Country",
      "days": 3,
      "description": "2-3 sentence overview of why this city rocks for the traveler.",
      "activities": [
        {
          "name": "Place Name",
          "category": "landmark|fitness|restaurant|neighborhood|hidden-gem|outdoor",
          "description": "1-2 sentence description with specific details.",
          "link": "https://www.google.com/maps/search/Place+Name+City+Country",
          "priceRange": "$|$$|$$$"
        }
      ]
    }
  ],
  "totalDays": 10,
  "reasoning": "2-3 sentences explaining the overall plan."
}

RULES:
- Suggest 2-5 cities maximum
- 6-10 activities per city
- Include at least 1 fitness studio per city
- Include at least 2 restaurants per city
- Include at least 1 hidden gem per city
- Use real, verified business names and locations
- Generate Google Maps search URLs for each activity (format: https://www.google.com/maps/search/Place+Name+City)
- Only include "priceRange" for restaurants
- Keep totalDays between 3 and 14`;

function buildBrainstormSystemPrompt(destination: string, retreatName: string) {
  return `You are a friendly travel planning assistant for SALTY Retreats. The traveler is planning a trip around their ${retreatName} retreat in ${destination} and might not know exactly what they want yet. Your job is to have a helpful, conversational exchange.

Be warm, casual, and enthusiastic. Reference the specific retreat destination. When asking questions, give 2-3 options to make it easy to answer.

Keep responses to 2-3 sentences max. Ask ONE question at a time.

When you feel you have enough info (usually after 2-3 exchanges), let them know you're ready to build a plan and suggest they click "Suggest Plans".

Do NOT return JSON. Just respond conversationally in plain text.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, retreatName, userPrompt, existingCities, mode = 'suggest', conversationHistory = [] } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Missing destination' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Brainstorm mode
    if (mode === 'brainstorm') {
      if (!apiKey) {
        return NextResponse.json({
          message: `You're heading to ${destination} — exciting! What kind of vibe are you going for? Are you more of a "lazy beach days with a good book" person, a "let's rent a scooter and explore hidden coves" type, or a "take me to every restaurant and bar" kind of traveler?`,
        });
      }

      const messages: { role: string; content: string }[] = [];

      // Build message history from conversation
      for (const msg of conversationHistory.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content });
      }

      // Add latest user prompt if provided and not already in history
      if (userPrompt && (messages.length === 0 || messages[messages.length - 1].content !== userPrompt)) {
        messages.push({ role: 'user', content: userPrompt });
      }

      // Ensure we have at least one user message
      if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
        messages.push({
          role: 'user',
          content: `I'm going to the ${retreatName} retreat in ${destination}. Help me plan what to do before or after!`,
        });
      }

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            system: buildBrainstormSystemPrompt(destination, retreatName),
            messages,
          }),
        });

        if (!response.ok) {
          console.error(`Claude API error (brainstorm): ${response.status}`);
          return NextResponse.json({
            message: `What kind of activities do you enjoy most when traveling? Are you more into food scenes, outdoor adventures, nightlife, or cultural experiences? That'll help me plan the perfect add-on to your ${destination} trip!`,
          });
        }

        const data = await response.json();
        const text = data.content?.[0]?.text;

        if (!text) {
          return NextResponse.json({
            message: `Tell me more about what you love doing when you travel! Are you a foodie, an adventurer, a culture buff, or all of the above?`,
          });
        }

        return NextResponse.json({ message: text });
      } catch {
        return NextResponse.json({
          message: `What kind of activities do you enjoy most when traveling? Are you more into food scenes, outdoor adventures, nightlife, or cultural experiences?`,
        });
      }
    }

    // Suggest mode
    if (!apiKey) {
      console.log('[Planner AI] No ANTHROPIC_API_KEY set, using fallback suggestions');
      const fallback = FALLBACK_SUGGESTIONS[destination] || {
        cities: [
          {
            id: `fallback-generic-1`,
            name: 'Explore the capital',
            country: destination,
            days: 2,
            description: 'Start your adventure by getting to know the local capital city.',
            activities: [
              { name: 'Local Markets', category: 'landmark' as const, description: 'Discover vibrant local markets and street food.', link: null },
              { name: 'Historical Sites', category: 'landmark' as const, description: 'Visit the most important historical landmarks.', link: null },
              { name: 'Food Scene', category: 'restaurant' as const, description: 'Sample the best local cuisine.', link: null, priceRange: '$$' as const },
              { name: 'Local Gym', category: 'fitness' as const, description: 'Keep up your training at a local fitness facility.', link: null },
              { name: 'Hidden Neighborhood', category: 'hidden-gem' as const, description: 'Explore the lesser-known neighborhoods like a local.', link: null },
              { name: 'City Park', category: 'outdoor' as const, description: 'Enjoy green spaces and outdoor activities.', link: null },
            ],
            highlights: ['Local markets', 'Historical sites', 'Food scene'],
          },
        ],
        totalDays: 2,
        reasoning: `Explore ${destination} before or after your retreat to make the most of your trip!`,
      };
      return NextResponse.json(fallback);
    }

    // Build messages for Claude
    const existingCitiesInfo = existingCities && existingCities.length > 0
      ? `\nThe traveler has already added these cities to their itinerary: ${existingCities.join(', ')}. Suggest different cities that complement their existing plan.`
      : '';

    const messages: { role: string; content: string }[] = [];

    // Add conversation history for context
    for (const msg of conversationHistory.slice(-10)) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Build user message
    const userMessage = `The traveler is going to the ${retreatName} retreat in ${destination}.${existingCitiesInfo}${userPrompt ? `\n\nTheir preferences: "${userPrompt}"` : '\n\nSuggest your top picks for cities to explore before or after the retreat.'}`;

    // If there's no conversation or the last message is from assistant, add the user message
    if (messages.length === 0 || messages[messages.length - 1].role === 'assistant') {
      messages.push({ role: 'user', content: userMessage });
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          system: SUGGEST_SYSTEM_PROMPT,
          messages,
        }),
      });

      if (!response.ok) {
        console.error(`Claude API error: ${response.status} ${response.statusText}`);
        const fallback = FALLBACK_SUGGESTIONS[destination];
        if (fallback) return NextResponse.json(fallback);
        return NextResponse.json({ error: 'AI suggestion service unavailable' }, { status: 503 });
      }

      const data = await response.json();
      const text = data.content?.[0]?.text;

      if (!text) {
        console.error('Claude returned empty response');
        const fallback = FALLBACK_SUGGESTIONS[destination];
        if (fallback) return NextResponse.json(fallback);
        return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
      }

      // Parse the JSON response from Claude
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not parse JSON from Claude response:', text);
        const fallback = FALLBACK_SUGGESTIONS[destination];
        if (fallback) return NextResponse.json(fallback);
        return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 });
      }

      const suggestion: SuggestionResponse = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (!suggestion.cities || !Array.isArray(suggestion.cities) || suggestion.cities.length === 0) {
        const fallback = FALLBACK_SUGGESTIONS[destination];
        if (fallback) return NextResponse.json(fallback);
        return NextResponse.json({ error: 'Invalid suggestion structure' }, { status: 500 });
      }

      // Add IDs to cities and ensure activities arrays exist
      const now = Date.now();
      suggestion.cities = suggestion.cities.map((city, index) => ({
        ...city,
        id: city.id || `suggested-${now}-${index}`,
        activities: Array.isArray(city.activities) ? city.activities : [],
      }));

      return NextResponse.json(suggestion);
    } catch (error) {
      console.error('Claude API call failed:', error);
      const fallback = FALLBACK_SUGGESTIONS[destination];
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json({ error: 'AI suggestion service unavailable' }, { status: 503 });
    }
  } catch (error) {
    console.error('Planner suggest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
