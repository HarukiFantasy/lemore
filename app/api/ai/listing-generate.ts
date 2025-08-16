import { z } from 'zod';
import OpenAI from 'openai';
import type { 
  AIListingGenerateResponse, 
  ApiResponse 
} from '~/features/let-go-buddy/types';

// Validation schema
const listingGenerateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  features: z.array(z.string()).default([]),
  condition: z.string().min(1, 'Condition is required'),
  locale_from: z.string().default('en'),
  locales_to: z.array(z.enum(['en', 'ko'])).min(1, 'At least one target language required'),
  tone: z.enum(['plain', 'friendly']).default('friendly'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// React Router action for AI listing generation
export async function action({ request }: { request: Request }) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = listingGenerateSchema.parse(body);

    const languages = validatedData.locales_to.map(lang => 
      lang === 'ko' ? 'Korean' : 'English'
    ).join(' and ');

    // Prepare AI prompt
    const systemPrompt = `You are an expert marketplace listing writer. Create compelling, honest listings for secondhand items.

Return JSON in this format:
{
  "listings": {
    "en": {
      "title": "string (concise, searchable title)",
      "body": "string (detailed description)",
      "hashtags": ["string"] (3-5 relevant hashtags without # symbol)
    },
    "ko": {
      "title": "string (Korean title)",
      "body": "string (Korean description)", 
      "hashtags": ["string"] (Korean hashtags)
    }
  }
}

Guidelines:
- Be honest about condition and flaws
- Highlight key features and benefits
- Include practical details (size, material, usage)
- Use marketplace-friendly language
- Tone: ${validatedData.tone}
- Avoid exaggerated claims
- Include pickup/delivery notes if relevant
- Make titles searchable and clear`;

    const featuresText = validatedData.features.length > 0 
      ? `Features: ${validatedData.features.join(', ')}`
      : '';

    const userPrompt = `Create marketplace listings for this item:

Title: ${validatedData.title}
Condition: ${validatedData.condition}
${featuresText}

Generate listings in: ${languages}

Make the listings compelling but honest. Focus on what makes this item valuable to a buyer.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let listingResult: AIListingGenerateResponse;
    try {
      listingResult = JSON.parse(aiResponse);
    } catch (error) {
      throw new Error('Invalid JSON response from AI');
    }

    // Validate AI response structure
    const listingSchema = z.object({
      title: z.string().min(1),
      body: z.string().min(10),
      hashtags: z.array(z.string()).min(1).max(10),
    });

    const responseSchema = z.object({
      listings: z.record(
        z.enum(['en', 'ko']),
        listingSchema
      ),
    });

    const validatedResponse = responseSchema.parse(listingResult);

    // Ensure requested languages are present
    for (const lang of validatedData.locales_to) {
      if (!validatedResponse.listings[lang]) {
        throw new Error(`Missing listing for language: ${lang}`);
      }
    }

    // Filter to only requested languages
    const filteredListings: { [lang: string]: any } = {};
    for (const lang of validatedData.locales_to) {
      filteredListings[lang] = validatedResponse.listings[lang];
    }

    const response: ApiResponse<AIListingGenerateResponse> = {
      data: {
        listings: filteredListings
      },
      meta: {
        request_id: requestId,
        duration_ms: Date.now() - startTime,
        model: 'gpt-4o',
        version: '1.0.0'
      }
    };

    return response;

  } catch (error) {
    console.error('AI listing-generate error:', error);

    const errorResponse: ApiResponse<AIListingGenerateResponse> = {
      error: {
        code: error instanceof z.ZodError ? 'validation_error' : 'internal_error',
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : 'Failed to generate listings. Please try again.'
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