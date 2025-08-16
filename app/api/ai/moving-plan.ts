import { z } from 'zod';
import OpenAI from 'openai';
import type { ApiResponse } from '~/features/let-go-buddy/types';

// Validation schema
const movingPlanSchema = z.object({
  moveDate: z.string(),
  region: z.string(),
  inventory: z.array(z.object({
    category: z.string().optional(),
    hasImages: z.boolean(),
    imageCount: z.number(),
    images: z.array(z.string())
  }))
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MovingPlanResponse {
  timeline: {
    week: number;
    startDate: string;
    endDate: string;
    tasks: string[];
    priority: 'high' | 'medium' | 'low';
  }[];
  actionItems: string[];
  tips: string[];
  estimatedBoxes: number;
  specialConsiderations: string[];
}

// React Router action for generating moving plan
export async function action({ request }: { request: Request }) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const body = await request.json();
    const validatedData = movingPlanSchema.parse(body);

    // Calculate weeks until move
    const moveDate = new Date(validatedData.moveDate);
    const today = new Date();
    const daysUntilMove = Math.ceil((moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksUntilMove = Math.ceil(daysUntilMove / 7);

    // Build inventory description
    const inventoryDesc = validatedData.inventory
      .map(cat => `${cat.category}: ${cat.imageCount > 0 ? `${cat.imageCount} items shown` : 'selected'}`)
      .join(', ');

    const systemPrompt = `You are an expert moving coordinator. Create a detailed moving plan based on the user's inventory and timeline.

Return a JSON response with this structure:
{
  "timeline": [
    {
      "week": 1,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD", 
      "tasks": ["task1", "task2", ...],
      "priority": "high" | "medium" | "low"
    }
  ],
  "actionItems": ["urgent action 1", "urgent action 2", ...],
  "tips": ["helpful tip 1", "helpful tip 2", ...],
  "estimatedBoxes": number,
  "specialConsiderations": ["consideration 1", "consideration 2", ...]
}

Create a realistic week-by-week schedule leading up to the move date.
Focus on practical tasks like sorting, packing, selling unwanted items, arranging movers, etc.
The plan should be specific to the categories of items they have.`;

    const userPrompt = `Create a moving plan for:
- Move Date: ${validatedData.moveDate}
- Destination: ${validatedData.region}
- Days until move: ${daysUntilMove}
- Weeks available: ${weeksUntilMove}
- Inventory: ${inventoryDesc}

Please create a practical ${weeksUntilMove}-week moving plan with specific tasks for each week.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse and validate response
    const planData: MovingPlanResponse = JSON.parse(aiResponse);

    const response: ApiResponse<MovingPlanResponse> = {
      data: planData,
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
    console.error('Moving plan generation error:', error);

    let errorMessage = 'Failed to generate moving plan';
    let errorCode = 'internal_error';

    if (error instanceof z.ZodError) {
      errorCode = 'validation_error';
      errorMessage = error.errors.map(e => e.message).join(', ');
    }

    const errorResponse: ApiResponse<MovingPlanResponse> = {
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
}