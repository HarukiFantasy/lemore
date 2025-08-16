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

  // Prepare AI prompt (define at function level for accessibility in catch block)
  const systemPrompt = `You are an expert item decluttering analyst. Analyze the provided item and return a JSON response with the following structure:

{
  "title": "string (descriptive name of the item, e.g., 'Black Leather Office Chair', 'Vintage Blue Ceramic Vase', 'Red Winter Coat Size M')",
  "category": "string (e.g., 'furniture', 'clothing', 'electronics', 'books', 'kitchenware', 'decor', 'sports', 'toys', 'other')",
  "condition": "string (e.g., 'excellent', 'good', 'fair', 'poor')",
  "usage_score": number (0-100, ESTIMATED typical usage frequency based on item type - 100 = items typically used daily, 80 = weekly items, 60 = monthly items, 40 = seasonal/occasional items, 20 = rarely used items, 0 = decorative/collectible items),
  "sentiment": "string (e.g., 'attached', 'neutral', 'ready_to_let_go')",
  "recommendation": "string ('keep', 'sell', 'donate', or 'dispose')",
  "rationale": "string (brief explanation for the recommendation)"
}

IMPORTANT for usage_score:
- This is an ESTIMATE of typical usage frequency based on the item type, NOT actual user behavior
- Base the score on how often items of this type are generally used in households
- Examples: toothbrush/phone = 90-100 (daily), workout equipment = 60-80 (few times/week), board games = 20-40 (occasional), holiday decorations = 10-20 (seasonal)
- Consider item condition as a hint: worn items might indicate higher usage than pristine ones
- Be conservative - when unsure, estimate lower rather than higher

Other factors:
- Condition and marketability
- Emotional attachment indicators
- Storage space efficiency  
- Market demand and resale value

Be realistic about actual usage patterns, not ideal usage.`;

  // Define response schema for validation (move outside try block for accessibility)
  const responseSchema = z.object({
    title: z.string(),
    category: z.string(),
    condition: z.string(),
    usage_score: z.number().min(0).max(100),
    sentiment: z.string(),
    recommendation: z.enum(['keep', 'sell', 'donate', 'dispose']),
    rationale: z.string(),
  });
  
  // Parse and validate request body
  let validatedData: any;
  
  try {
    const body = await request.json();
    validatedData = analyzeItemSchema.parse(body);

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
          // Test if the URL is accessible by making a HEAD request
          console.log('Testing image URL accessibility:', url);
          
          // Add a timeout to the URL fetch test
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          try {
            const response = await fetch(url, { 
              method: 'HEAD',
              signal: controller.signal 
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
              console.log('Image URL is accessible, adding to analysis:', url);
              imageContent.push({
                type: 'image_url',
                image_url: { url, detail: 'low' }
              });
            } else {
              console.warn('Image URL returned non-OK status:', response.status, url);
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            console.warn('Image URL accessibility test failed:', url, fetchError);
          }
        }
      } catch (error) {
        console.warn('Skipping invalid image URL:', url, error);
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

    // Call OpenAI API with timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timed out')), 30000); // 30 second timeout
    });

    const apiPromise = openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const completion = await Promise.race([apiPromise, timeoutPromise]) as any;

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
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error stringified:', JSON.stringify(error, null, 2));

    let errorMessage = 'Failed to analyze item. Please try again.';
    let errorCode = 'internal_error';

    if (error instanceof z.ZodError) {
      errorCode = 'validation_error';
      errorMessage = error.errors.map(e => e.message).join(', ');
    } else if (error && typeof error === 'object') {
      // Handle timeout errors
      if (error instanceof Error && error.message === 'Analysis timed out') {
        errorCode = 'timeout_error';
        errorMessage = 'Analysis timed out. Please try with smaller images.';
      } 
      // Handle OpenAI specific errors (including BadRequestError from OpenAI SDK)
      else if (('code' in error && typeof error === 'object') || 
               (error instanceof Error && error.message.includes('Timeout while downloading')) ||
               (error?.constructor?.name === 'BadRequestError') ||
               (error instanceof Error && error.toString().includes('Timeout while downloading'))) {
        if (('code' in error && (error as any).code === 'invalid_image_url') || 
            (error instanceof Error && error.message.includes('Timeout while downloading')) ||
            (error?.constructor?.name === 'BadRequestError' && error.toString().includes('Timeout while downloading')) ||
            ('error' in error && typeof error.error === 'object' && error.error && 
             'message' in error.error && typeof error.error.message === 'string' && 
             error.error.message.includes('Timeout while downloading'))) {
          // Try fallback text-only analysis for image timeout errors
          console.log('Image access failed, attempting text-only analysis fallback...');
          console.log('Triggering fallback because:', {
            hasCode: 'code' in error,
            isError: error instanceof Error,
            messageIncludes: error instanceof Error && error.message.includes('Timeout while downloading'),
            constructorName: error?.constructor?.name,
            toStringIncludes: error instanceof Error && error.toString().includes('Timeout while downloading')
          });
          
          try {
            // Only attempt fallback if we have valid data
            if (!validatedData) {
              throw new Error('No valid data for fallback analysis');
            }
            
            const fallbackUserPrompt = `Item: ${validatedData.title || 'Untitled'}
${validatedData.notes ? `Notes: ${validatedData.notes}` : ''}
${validatedData.context ? `Context: Scenario ${validatedData.context.scenario}, Region: ${validatedData.context.region}` : ''}

Please analyze this item and provide recommendations. Note: Image analysis unavailable due to technical issues. Please provide best-guess analysis based on the item title and notes provided.`;

            const fallbackMessages: any[] = [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: fallbackUserPrompt
              }
            ];
            
            const fallbackCompletion = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: fallbackMessages,
              max_tokens: 500,
              temperature: 0.7,
              response_format: { type: 'json_object' }
            });
            
            const fallbackResponse = fallbackCompletion.choices[0]?.message?.content;
            if (fallbackResponse) {
              const fallbackResult = JSON.parse(fallbackResponse);
              const validatedFallback = responseSchema.parse({
                ...fallbackResult,
                rationale: `${fallbackResult.rationale} (Note: Analysis based on text only due to image access issues)`
              });
              
              const response: ApiResponse<AIAnalyzeItemResponse> = {
                data: validatedFallback,
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
            }
          } catch (fallbackError) {
            console.error('Fallback analysis also failed:', fallbackError);
          }
          
          errorCode = 'image_access_error';
          errorMessage = 'Image download timeout from storage. Fallback text-only analysis also failed. Please try uploading smaller images or try again later.';
        }
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