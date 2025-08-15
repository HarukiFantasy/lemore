import { z } from 'zod';
import OpenAI from 'openai';
import type { 
  AIAnalyzeItemResponse, 
  ApiResponse 
} from '~/features/let-go-buddy/types';

// Validation schema
const analyzeItemSchema = z.object({
  photos: z.array(z.string()).min(1, 'At least one photo is required'),
  context: z.object({
    scenario: z.string().optional(),
    region: z.string().optional().nullable(),
  }).optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  locale: z.string().default('en'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// React Router action for AI item analysis
export async function action({ request }: { request: Request }) {
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

    // Skip blob URL check - use real OpenAI API for all requests
    
    const userPrompt = `Item: ${validatedData.title || 'Untitled'}
${validatedData.notes ? `Notes: ${validatedData.notes}` : ''}
${validatedData.context ? `Context: Scenario ${validatedData.context.scenario}, Region: ${validatedData.context.region}` : ''}

Please analyze this item and provide recommendations. I've included ${validatedData.photos.length} photo(s) for reference.`;

    // Prepare messages for OpenAI with image URL validation
    let imageContent: any[] = [];
    
    // Test image URLs and only include accessible ones
    for (const url of validatedData.photos) {
      try {
        // Simple URL format check
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          imageContent.push({
            type: 'image_url',
            image_url: { url, detail: 'low' }
          });
        }
      } catch (error) {
        console.warn('Skipping invalid image URL:', url);
      }
    }

    // If no valid images, provide text-only analysis
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: imageContent.length > 0 
              ? userPrompt 
              : `${userPrompt}\n\nNote: Unable to analyze photos due to technical issues. Please provide analysis based on the item description only.`
          },
          ...imageContent
        ]
      }
    ];

    // Call OpenAI API with timeout handling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      timeout: 30000 // 30 second timeout
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
        model: 'gpt-4o',
        version: '1.0.0'
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI analyze-item error:', error);

    let errorMessage = 'Failed to analyze item. Please try again.';
    let errorCode = 'internal_error';

    if (error instanceof z.ZodError) {
      errorCode = 'validation_error';
      errorMessage = error.errors.map(e => e.message).join(', ');
    } else if (error && typeof error === 'object' && 'code' in error) {
      // Handle OpenAI specific errors
      if (error.code === 'invalid_image_url') {
        errorCode = 'image_access_error';
        errorMessage = 'Unable to access uploaded images. Please try uploading again.';
      } else if (error.code === 'timeout') {
        errorCode = 'timeout_error';
        errorMessage = 'Analysis timed out. Please try with smaller images.';
      }
    }

    const errorResponse: ApiResponse<AIAnalyzeItemResponse> = {
      error: {
        code: errorCode,
        message: errorMessage
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
};