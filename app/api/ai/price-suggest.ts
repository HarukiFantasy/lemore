import { z } from 'zod';
import OpenAI from 'openai';
import type { 
  AIPriceSuggestResponse, 
  ApiResponse 
} from '~/features/let-go-buddy/types';

// Validation schema
const priceSuggestSchema = z.object({
  photos: z.array(z.string()).min(1, 'At least one photo is required'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  context: z.object({
    region: z.string().optional().nullable(),
    scenario: z.string().optional(),
  }).optional(),
  locale: z.string().default('en'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// React Router action for AI price suggestion
export async function action({ request }: { request: Request }) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = priceSuggestSchema.parse(body);

    // Regional pricing context
    const regionContext = {
      'Thailand': { currency: 'USD', context: 'Thai market, convert to local THB mentally' },
      'Bangkok': { currency: 'USD', context: 'Bangkok market, convert to local THB mentally' },
      'Korea': { currency: 'USD', context: 'Korean market, convert to local KRW mentally' },
      'Seoul': { currency: 'USD', context: 'Seoul market, convert to local KRW mentally' },
    };

    const regionKey = validatedData.context?.region || 'Thailand';
    const region = regionContext[regionKey as keyof typeof regionContext] || 
                  regionContext['Thailand'];

    // Prepare AI prompt for price suggestions
    const systemPrompt = `You are an expert in secondhand item pricing. Analyze the provided item and return a JSON response with price suggestions in USD:

{
  "price_low": number (conservative/quick sale price),
  "price_mid": number (fair market value),
  "price_high": number (optimistic/premium price),
  "confidence": number (0.0-1.0, confidence in pricing accuracy),
  "rationale": "string (brief explanation of pricing factors)",
  "market_notes": "string (additional market insights)"
}

Consider these factors:
- Item condition and age
- Category market demand
- Regional market differences
- Seasonal factors
- Brand value and popularity
- Comparable items on marketplace platforms

Be realistic and consider local secondhand market conditions. ${region.context}.`;

    const userPrompt = `Item: ${validatedData.title}
Category: ${validatedData.category}
Condition: ${validatedData.condition}
${regionKey ? `Region: ${regionKey}` : ''}

Please analyze this item and provide price suggestions for selling on secondhand marketplaces. I've included ${validatedData.photos.length} photo(s) for reference.`;

    // Prepare messages for OpenAI
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          ...validatedData.photos.map(url => ({
            type: 'image_url',
            image_url: { url, detail: 'low' }
          }))
        ]
      }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 400,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let pricingResult: AIPriceSuggestResponse;
    try {
      pricingResult = JSON.parse(aiResponse);
    } catch (error) {
      throw new Error('Invalid JSON response from AI');
    }

    // Validate AI response structure
    const responseSchema = z.object({
      price_low: z.number().min(0),
      price_mid: z.number().min(0),
      price_high: z.number().min(0),
      confidence: z.number().min(0).max(1),
      rationale: z.string(),
      market_notes: z.string().optional(),
    });

    const validatedResponse = responseSchema.parse(pricingResult);

    // Ensure price order is correct
    if (validatedResponse.price_low > validatedResponse.price_mid ||
        validatedResponse.price_mid > validatedResponse.price_high) {
      throw new Error('Invalid price range order');
    }

    const response: ApiResponse<AIPriceSuggestResponse> = {
      data: validatedResponse,
      meta: {
        request_id: requestId,
        duration_ms: Date.now() - startTime,
        model: 'gpt-4o',
        version: '1.0.0'
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI price-suggest error:', error);

    const errorResponse: ApiResponse<AIPriceSuggestResponse> = {
      error: {
        code: error instanceof z.ZodError ? 'validation_error' : 'internal_error',
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : 'Failed to suggest pricing. Please try again.'
      },
      meta: {
        request_id: requestId,
        duration_ms: Date.now() - startTime,
        version: '1.0.0'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}