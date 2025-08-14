import { z } from 'zod';
import OpenAI from 'openai';
import type { 
  AIPriceSuggestResponse, 
  ApiResponse 
} from '~/features/let-go-buddy/types';

// Validation schema
const priceSuggestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  region: z.string().min(1, 'Region is required'),
  comps: z.array(z.any()).optional(),
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
      'Thailand': { currency: 'THB', context: 'Thai baht, consider local market conditions' },
      'Bangkok': { currency: 'THB', context: 'Bangkok market, higher purchasing power' },
      'Korea': { currency: 'KRW', context: 'Korean won, consider local market conditions' },
      'Seoul': { currency: 'KRW', context: 'Seoul market, higher purchasing power' },
    };

    const region = regionContext[validatedData.region as keyof typeof regionContext] || 
                  regionContext['Thailand'];

    // Prepare AI prompt
    const systemPrompt = `You are a pricing expert for secondhand items. Provide pricing suggestions in JSON format:

{
  "price_low": number (conservative estimate),
  "price_mid": number (realistic market price),
  "price_high": number (optimistic estimate),
  "confidence": number (0.0-1.0, confidence in pricing accuracy),
  "factors": string[] (key factors affecting price)
}

Consider these factors:
- Item condition and age
- Brand reputation and quality
- Market demand and supply
- Seasonal factors
- Regional market conditions
- Depreciation rates for the category

Provide realistic secondhand market prices in ${region.currency}. ${region.context}.`;

    const userPrompt = `Item: ${validatedData.title}
Category: ${validatedData.category}
Condition: ${validatedData.condition}
Location: ${validatedData.region}

Please suggest pricing for this secondhand item. Be realistic about depreciation and local market conditions.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
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
      factors: z.array(z.string()),
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
        model: 'gpt-4',
        version: '1.0.0'
      }
    };

    return response;

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

    throw errorResponse;
  }
}