import OpenAI from "openai";
import { insertItemAnalysis } from "../mutations";
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
  environmental_impact: {
    impact_level: string;
    co2_impact: number;
    landfill_impact: string;
    is_recyclable: boolean;
    sustainability_score: number;
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
  // Check authentication first
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return Response.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  const imageUrls = url.searchParams.get("imageUrls");
  const situation = url.searchParams.get("situation");

  if (!sessionId || !imageUrls || !situation) {
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const parsedImageUrls = JSON.parse(decodeURIComponent(imageUrls));
    
    // 이미지들을 Base64로 변환
    const base64Images = await Promise.all(
      parsedImageUrls.map((url: string) => convertImageUrlToBase64(url))
    );
    
    // OpenAI Vision API를 사용해서 이미지 분석
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI decluttering assistant. Analyze the uploaded images and provide detailed recommendations for each item.

Your task is to:
1. Identify the item(s) in the images
2. Assess their condition and value
3. Provide recommendations based on the user's decluttering situation: ${situation}
4. Calculate environmental impact and CO2 savings
5. Suggest pricing if selling is recommended

Be thorough and consider:
- Item condition and age
- Current market value
- Environmental impact of disposal vs reuse
- Emotional attachment factors
- Space value and maintenance costs
- Local market conditions in Thailand

Please respond with a JSON object containing the analysis with the following structure:
{
  "item_name": "string",
  "item_category": "Electronics|Clothing|Books|Home|Sports|Beauty|Toys|Automotive|Health|Other",
  "item_condition": "New|Like New|Excellent|Good|Fair|Poor",
            "recommendation": "Keep|Sell|Donate|Recycle|Repair|Repurpose|Discard",
          "recommendation_reason": "string (detailed explanation of why this recommendation was chosen)",
          "ai_suggestion": "string",
  "emotional_score": number (1-10),
  "environmental_impact": "Low|Medium|High|Critical",
  "co2_impact": number,
  "landfill_impact": "string",
  "is_recyclable": boolean,
  "original_price": number (optional),
  "current_value": number (optional),
  "ai_listing_price": number (optional),
  "maintenance_cost": number (optional),
  "space_value": number (optional),
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
              text: `Please analyze these images and provide a comprehensive decluttering recommendation. Consider the user's situation: ${situation}. Respond with valid JSON only.`
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

    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      return Response.json(
        { error: "No analysis generated" },
        { status: 400 }
      );
    }

    // JSON 파싱 시도
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (error) {
      return Response.json(
        { error: "Invalid analysis format" },
        { status: 400 }
      );
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
        brand: analysis.brand,
        original_price: analysis.original_price,
        current_value: analysis.current_value
      },
      environmental_impact: {
        impact_level: analysis.environmental_impact,
        co2_impact: analysis.co2_impact,
        landfill_impact: analysis.landfill_impact,
        is_recyclable: analysis.is_recyclable,
        sustainability_score: 8 // Default value
      },
      recommendation: {
        action: analysis.recommendation,
        confidence: 85, // Default confidence
        reason: analysis.recommendation_reason,
        ai_suggestion: analysis.ai_suggestion
      },
      listing_data: {
        title: analysis.ai_listing_title || `${analysis.item_name} for Sale`,
        description: analysis.ai_listing_description || `Great condition ${analysis.item_name}`,
        price: analysis.ai_listing_price?.toString() || analysis.current_value?.toString() || "0",
        currency: "THB",
        price_type: "Fixed",
        condition: analysis.item_condition,
        category: analysis.item_category,
        location: analysis.ai_listing_location || "Bangkok",
        selling_points: [], // Default empty array
        keywords: [] // Default empty array
      }
    };

    // 분석 결과를 데이터베이스에 저장
    const { client } = makeSSRClient(request);
    await insertItemAnalysis(client, {
      session_id: parseInt(sessionId),
      ...analysis,
      images: parsedImageUrls,
    });

    return Response.json(transformedAnalysis);
  } catch (error) {
    console.error("AI analysis error:", error);
    return Response.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
};

// This page is used only for analysis logic - no UI component needed
// The UI is handled by let-go-buddy-page.tsx
