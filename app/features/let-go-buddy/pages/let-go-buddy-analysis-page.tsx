import OpenAI from "openai";
import { insertItemAnalysis, markSessionCompleted } from "../mutations";
import { makeSSRClient } from "~/supa-client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LoaderData {
  emotional_assessment: {
    attachment_level: string;
    emotional_score: number;
    emotional_tags: string[];
    emotional_recommendation: string;
  };
  item_analysis: {
    item_name: string;
    item_category: string;
    item_condition: string;
    condition_notes?: string;
    estimated_age?: string;
    brand?: string;
    original_price?: number;
    current_value: number;
  };
  recommendation: {
    action: string;
    confidence: number;
    reason: string;
    ai_suggestion: string;
  };
  listing_data: {
    title: string;
    description: string;
    price: string;
    currency: string;
    price_type: string;
    condition: string;
    category: string;
    location: string;
    selling_points: string[];
    keywords: string[];
  };
}

// 이미지를 Base64로 변환하는 함수
async function convertImageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error: unknown) {
    console.error('Error converting image to base64:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to convert image to base64: ${errorMessage}`);
  }
}

export const loader = async ({ request }: { request: Request }) => {
  console.log('Analysis loader called');
  console.log('Request URL:', request.url);
  
  // Check authentication first
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    console.log('Authentication failed');
    return Response.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  const imageUrls = url.searchParams.get("imageUrls");
  const situation = url.searchParams.get("situation");
  const chatConversation = url.searchParams.get("chatConversation");

  console.log('Analysis params:', { sessionId, imageUrls, situation, chatConversation });

  if (!sessionId || !imageUrls || !situation) {
    console.log('Missing required parameters');
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    console.log('Starting parameter parsing...');
    let parsedImageUrls, parsedChatConversation;
    
    try {
      parsedImageUrls = JSON.parse(decodeURIComponent(imageUrls));
      parsedChatConversation = chatConversation ? JSON.parse(decodeURIComponent(chatConversation)) : [];
      console.log('Parameter parsing successful');
      console.log('Parsed chat conversation:', parsedChatConversation);
    } catch (parseError) {
      console.error('Parameter parsing failed:', parseError);
      throw new Error(`Parameter parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
    
    console.log('Starting image conversion to base64...');
    let base64Images;
    try {
      // 이미지들을 Base64로 변환
      base64Images = await Promise.all(
        parsedImageUrls.map((url: string) => convertImageUrlToBase64(url))
      );
      console.log('Image conversion successful');
      console.log('Base64 images info:', base64Images.map((img, idx) => ({
        index: idx,
        size: Math.round(img.length / 1024),
        prefix: img.substring(0, 50)
      })));
    } catch (imageError) {
      console.error('Image conversion failed:', imageError);
      throw new Error(`Image conversion failed: ${imageError instanceof Error ? imageError.message : 'Unknown image error'}`);
    }
    
    console.log('Starting OpenAI API call...');
    
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    
    // Create a shorter conversation context to avoid token limits
    const conversationContext = parsedChatConversation.length > 0 
      ? `\n\nKey conversation insights: ${parsedChatConversation.slice(-3).map((message: any) => 
          `${message.type === 'ai' ? 'Joy' : 'User'}: ${message.content.substring(0, 200)}`
        ).join('\n')}`
      : "";
    
    let completion;
    try {
      // OpenAI Vision API를 사용해서 이미지 분석
      completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI decision-making assistant for decluttering. Your job is to help users make confident decisions about their items based on their personal situation and feelings.

IMPORTANT: 
- Focus on decision-making, NOT pricing. Do not estimate market values or suggest prices.
- CRITICAL: Use ONLY the exact enum values specified in the JSON schema. Do not use variations like "Gift", "Give Away", etc.

Your task is to:
1. Identify the item(s) in the images
2. Assess their condition 
3. **Extract key insights from the coaching conversation** 
4. Analyze the user's decision patterns and emotional relationship with the item
5. Provide personalized recommendations based on their situation: ${situation}

**IMPORTANT: Pay special attention to extracting conversation insights:**
- **Emotional patterns**: How do they feel about letting go? (guilt, attachment, conflict, etc.)
- **Usage patterns**: How often they use items, why they keep things, when they last used it
- **Decision style**: Are they practical, sentimental, thoughtful, impulsive?
- **Barriers**: What makes decisions hard for them? (waste guilt, uncertainty, attachment)
- **Motivations**: What drives their decluttering? (space, minimalism, moving, etc.)

Analyze the conversation below to understand their personal decluttering psychology:${conversationContext}

Please respond with a JSON object containing the analysis with the following structure:
{
  "item_name": "string",
  "item_category": "Electronics|Clothing|Books|Home|Sports|Beauty|Toys|Automotive|Health|Other",
  "item_condition": "New|Like New|Excellent|Good|Fair|Poor",
            "recommendation": "Keep|Sell|Donate|Recycle|Repair|Repurpose|Discard", // MUST be exactly one of these values
          "recommendation_reason": "string (detailed explanation of why this recommendation was chosen, including practical next steps)",
  
  // Conversation insights (extract 3-5 keywords maximum for each category based on the conversation):
  "emotional_attachment_keywords": ["keyword1", "keyword2", "keyword3"], // user's emotional connection (e.g. ["sentimental", "guilt", "conflicted"])
  "usage_pattern_keywords": ["keyword1", "keyword2", "keyword3"], // how they use/used the item (e.g. ["rarely_used", "forgotten", "seasonal"])
  "decision_factor_keywords": ["keyword1", "keyword2", "keyword3"], // main decision considerations (e.g. ["space_concern", "cost_guilt", "practicality"])
  "personality_insights": ["keyword1", "keyword2", "keyword3"], // user's decision-making style (e.g. ["thoughtful", "nostalgic", "practical"])
  "decision_barriers": ["keyword1", "keyword2", "keyword3"], // what's preventing easy decision (e.g. ["guilt", "uncertainty", "waste_concern"])
  
  "emotional_score": number (1-10),
  "ai_listing_title": "string" (optional),
  "ai_listing_description": "string" (optional),
  "ai_listing_location": "Bangkok|ChiangMai|Phuket|HuaHin|Pattaya|Krabi|Koh Samui|Other Cities" (optional)
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text", 
              text: `Please analyze these images and provide a personalized decluttering decision recommendation.

User's Situation: ${situation}${conversationContext}

Based on the conversation above, provide a recommendation that aligns with their emotional attachment, usage patterns, and decluttering goals expressed during the coaching session. Focus on helping them make a confident decision rather than market value. Respond with valid JSON only.`
            },
            ...base64Images.map((base64Image: string) => ({
              type: "image_url" as const,
              image_url: {
                url: base64Image
              }
            }))
          ]
        }
      ],
      response_format: { type: "json_object" },
    });

    console.log('OpenAI API call successful');
    console.log('OpenAI completion response:', {
      choices: completion.choices?.length || 0,
      firstChoice: completion.choices?.[0] ? {
        message: {
          role: completion.choices[0].message?.role,
          contentLength: completion.choices[0].message?.content?.length || 0,
          hasContent: !!completion.choices[0].message?.content
        },
        finishReason: completion.choices[0].finish_reason
      } : null
    });
    } catch (openaiError) {
      console.error('OpenAI API call failed:', openaiError);
      throw new Error(`OpenAI API failed: ${openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error'}`);
    }

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      console.error('No analysis content received from OpenAI');
      console.error('Full completion object:', JSON.stringify(completion, null, 2));
      return Response.json(
        { error: "No analysis generated", details: "OpenAI returned empty content" },
        { status: 400 }
      );
    }

    // JSON 파싱 시도
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
      console.log('Parsed AI analysis:', analysis);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      console.error('Analysis text that failed to parse:', analysisText);
      return Response.json(
        { error: "Invalid analysis format" },
        { status: 400 }
      );
    }

    // Validate required fields
    console.log('Validating required analysis fields...');
    if (!analysis.item_name) {
      console.error('Missing item_name in analysis');
      return Response.json({ error: "Missing item_name in analysis" }, { status: 400 });
    }
    if (!analysis.item_category) {
      console.error('Missing item_category in analysis');
      return Response.json({ error: "Missing item_category in analysis" }, { status: 400 });
    }
    if (!analysis.item_condition) {
      console.error('Missing item_condition in analysis');
      return Response.json({ error: "Missing item_condition in analysis" }, { status: 400 });
    }
    if (!analysis.recommendation) {
      console.error('Missing recommendation in analysis');
      return Response.json({ error: "Missing recommendation in analysis" }, { status: 400 });
    }
    if (!analysis.recommendation_reason) {
      console.error('Missing recommendation_reason in analysis');
      return Response.json({ error: "Missing recommendation_reason in analysis" }, { status: 400 });
    }

    // Transform the flat analysis structure to match the expected nested structure
    const transformedAnalysis = {
      emotional_assessment: {
        attachment_level: "medium", // Default value
        emotional_score: analysis.emotional_score || 5,
        emotional_tags: [], // Default empty array
        emotional_recommendation: analysis.recommendation_reason || ""
      },
      item_analysis: {
        item_name: analysis.item_name,
        item_category: analysis.item_category,
        item_condition: analysis.item_condition,
        condition_notes: analysis.condition_notes,
        estimated_age: analysis.estimated_age,
        brand: analysis.brand
      },
      recommendation: {
        action: analysis.recommendation,
        confidence: 85, // Default confidence
        reason: analysis.recommendation_reason
      },
      listing_data: {
        title: analysis.ai_listing_title || `${analysis.item_name} for Sale`,
        description: analysis.ai_listing_description || `Great condition ${analysis.item_name}`,
        price: "0", // User will set their own price
        currency: "THB",
        price_type: "Fixed",
        condition: analysis.item_condition,
        category: analysis.item_category,
        location: analysis.ai_listing_location || "Bangkok",
        selling_points: [], // Default empty array
        keywords: [] // Default empty array
      }
    };

    console.log('Starting database operations...');
    try {
      // 분석 결과를 데이터베이스에 저장 - use the same client from above
      
      // Validate and fix enum values before database insertion
      console.log('Validating and fixing enum values...');
      console.log('Original recommendation:', analysis.recommendation);
      
      // Map invalid recommendation values to valid enum values
      const validRecommendations = ['Keep', 'Sell', 'Donate', 'Recycle', 'Repair', 'Repurpose', 'Discard'];
      if (!validRecommendations.includes(analysis.recommendation)) {
        console.log(`Invalid recommendation "${analysis.recommendation}", mapping to valid value`);
        
        // Map common invalid values to valid enum values
        const recommendationMapping: Record<string, string> = {
          'Gift': 'Donate',
          'Give': 'Donate', 
          'Give Away': 'Donate',
          'Giveaway': 'Donate',
          'Pass On': 'Donate',
          'Throw Away': 'Discard',
          'Trash': 'Discard',
          'Dispose': 'Discard',
          'Upcycle': 'Repurpose',
          'Reuse': 'Repurpose',
          'Fix': 'Repair'
        };
        
        const mappedValue = recommendationMapping[analysis.recommendation];
        if (mappedValue) {
          console.log(`Mapping "${analysis.recommendation}" to "${mappedValue}"`);
          analysis.recommendation = mappedValue;
        } else {
          console.log(`Unknown recommendation "${analysis.recommendation}", defaulting to "Donate"`);
          analysis.recommendation = 'Donate';
        }
      }
      
      // Validate other enum fields
      const validCategories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Other'];
      if (!validCategories.includes(analysis.item_category)) {
        console.log(`Invalid item_category "${analysis.item_category}", defaulting to "Other"`);
        analysis.item_category = 'Other';
      }
      
      const validConditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor'];
      if (!validConditions.includes(analysis.item_condition)) {
        console.log(`Invalid item_condition "${analysis.item_condition}", defaulting to "Good"`);
        analysis.item_condition = 'Good';
      }
      
      const validLocations = ['Bangkok', 'ChiangMai', 'Phuket', 'HuaHin', 'Pattaya', 'Krabi', 'Koh Samui', 'Other Thai Cities', 'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Other Korean Cities'];
      if (analysis.ai_listing_location && !validLocations.includes(analysis.ai_listing_location)) {
        console.log(`Invalid ai_listing_location "${analysis.ai_listing_location}", defaulting to "Bangkok"`);
        analysis.ai_listing_location = 'Bangkok';
      }
      
      console.log('Final recommendation:', analysis.recommendation);
      
      console.log('Preparing analysis data for database insertion...');
      const analysisData = {
        session_id: parseInt(sessionId),
        item_name: analysis.item_name,
        item_category: analysis.item_category,
        item_condition: analysis.item_condition,
        recommendation: analysis.recommendation,
        recommendation_reason: analysis.recommendation_reason || "No specific reason provided",
        emotional_attachment_keywords: analysis.emotional_attachment_keywords || [],
        usage_pattern_keywords: analysis.usage_pattern_keywords || [],
        decision_factor_keywords: analysis.decision_factor_keywords || [],
        personality_insights: analysis.personality_insights || [],
        decision_barriers: analysis.decision_barriers || [],
        emotional_score: analysis.emotional_score || 5,
        ai_listing_title: analysis.ai_listing_title,
        ai_listing_description: analysis.ai_listing_description,
        ai_listing_location: analysis.ai_listing_location,
        images: parsedImageUrls,
      };
      
      console.log('Analysis data prepared:', analysisData);
      
      try {
        console.log('Calling insertItemAnalysis...');
        await insertItemAnalysis(client, analysisData);
        console.log('insertItemAnalysis successful');
      } catch (insertError) {
        console.error('insertItemAnalysis failed:', insertError);
        throw new Error(`insertItemAnalysis failed: ${insertError instanceof Error ? insertError.message : 'Unknown insert error'}`);
      }

      try {
        console.log('Marking session as completed...');
        console.log('Session ID:', sessionId);
        console.log('User ID:', user.id);
        
        // Directly update the session to avoid RLS issues
        const { error: updateError } = await client
          .from('let_go_buddy_sessions')
          .update({
            is_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', parseInt(sessionId))
          .eq('user_id', user.id);
          
        if (updateError) {
          console.error('Session update failed:', updateError);
          throw new Error(`Session update failed: ${updateError.message}`);
        }
        
        console.log('Session marked as completed successfully');
      } catch (markError) {
        console.error('markSessionCompleted failed:', markError);
        throw new Error(`markSessionCompleted failed: ${markError instanceof Error ? markError.message : 'Unknown session completion error'}`);
      }
      
      console.log('Database operations successful');
    } catch (dbError) {
      console.error('Database operations failed:', dbError);
      throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`);
    }

    console.log('Analysis completed successfully');
    console.log('Returning transformed analysis:', transformedAnalysis);
    return Response.json(transformedAnalysis);
  } catch (error) {
    console.error("AI analysis error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    return Response.json(
      { 
        error: "AI analysis failed", 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'UnknownError'
      },
      { status: 500 }
    );
  }
};