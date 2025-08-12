import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import type { 
  AIAnalyzeItemRequest, 
  AIAnalyzeItemResponse, 
  ApiResponse 
} from '~/features/let-go-buddy/types';

// Validation schema
const analyzeItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  image_urls: z.array(z.string().url()).min(1, 'At least one image is required'),
  locale: z.string().default('en'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = analyzeItemSchema.parse(body);

    // Prepare AI prompt
    const systemPrompt = `You are an expert item decluttering analyst. Analyze the provided item and return a JSON response with the following structure:

{
  "category": "string (e.g., 'furniture', 'clothing', 'electronics', 'books', 'kitchenware', 'decor', 'sports', 'toys', 'other')",
  "condition": "string (e.g., 'excellent', 'good', 'fair', 'poor')",
  "usage_score": number (0-100, where 100 = actively used daily, 0 = never used),
  "sentiment": "string (e.g., 'attached', 'neutral', 'ready_to_let_go')",
  "recommendation": "string ('keep', 'sell', 'donate', or 'dispose')",
  "rationale": "string (brief explanation for the recommendation)"
}

Consider these factors:
- Condition and marketability
- Practical utility and usage frequency
- Emotional attachment indicators
- Storage space efficiency
- Market demand and resale value

Be practical and honest in your assessment.`;

    const userPrompt = `Item: ${validatedData.title}
${validatedData.notes ? `Notes: ${validatedData.notes}` : ''}

Please analyze this item and provide recommendations. I've included ${validatedData.image_urls.length} photo(s) for reference.`;

    // Prepare messages for OpenAI
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          ...validatedData.image_urls.map(url => ({
            type: 'image_url',
            image_url: { url, detail: 'low' }
          }))
        ]
      }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let analysisResult: AIAnalyzeItemResponse;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (error) {
      throw new Error('Invalid JSON response from AI');
    }

    // Validate AI response structure
    const responseSchema = z.object({
      category: z.string(),
      condition: z.string(),
      usage_score: z.number().min(0).max(100),
      sentiment: z.string(),
      recommendation: z.enum(['keep', 'sell', 'donate', 'dispose']),
      rationale: z.string(),
    });

    const validatedResponse = responseSchema.parse(analysisResult);

    const response: ApiResponse<AIAnalyzeItemResponse> = {
      data: validatedResponse,
      meta: {
        request_id: requestId,
        duration_ms: Date.now() - startTime,
        model: 'gpt-4-vision-preview',
        version: '1.0.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI analyze-item error:', error);

    const errorResponse: ApiResponse<AIAnalyzeItemResponse> = {
      error: {
        code: error instanceof z.ZodError ? 'validation_error' : 'internal_error',
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : 'Failed to analyze item. Please try again.'
      },
      meta: {
        request_id: requestId,
        duration_ms: Date.now() - startTime,
        version: '1.0.0'
      }
    };

    return NextResponse.json(
      errorResponse, 
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}