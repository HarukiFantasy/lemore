import OpenAI from "openai";
import { insertItemAnalysis } from "../mutations";
import { makeSSRClient } from "~/supa-client";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import { SparklesIcon, HeartIcon, GlobeAltIcon, CheckCircleIcon, GiftIcon } from "@heroicons/react/24/outline";
import { Route } from "./+types/let-go-buddy-analysis-page";

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

    // 분석 결과를 데이터베이스에 저장
    const { client } = makeSSRClient(request);
    await insertItemAnalysis(client, {
      session_id: parseInt(sessionId),
      ...analysis,
      images: parsedImageUrls,
    });

    return Response.json(analysis);
  } catch (error) {
    console.error("AI analysis error:", error);
    return Response.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
};

export default function LetGoBuddyAnalysisPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  // Handle error case
  if (!loaderData || 'error' in loaderData) {
    return (
      <div className="w-full md:w-3/5 mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Analysis Failed</h1>
            <p className="text-gray-600 mb-4">
              {(loaderData as any)?.error || "An error occurred during analysis"}
            </p>
            <Button onClick={() => navigate('/let-go-buddy')} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analysis = loaderData as LoaderData;
  
  const handleStartSelling = () => {
    const listingData = {
      title: analysis.listing_data.title,
      description: analysis.listing_data.description,
      price: analysis.listing_data.price,
      currency: analysis.listing_data.currency,
      priceType: analysis.listing_data.price_type,
      condition: analysis.listing_data.condition,
      category: analysis.listing_data.category,
      location: analysis.listing_data.location,
      fromLetGoBuddy: true
    };

    navigate("/secondhand/submit-a-listing", {
      state: {
        prefillData: listingData,
        fromLetGoBuddy: true
      }
    });
  };

  const handleFreeGiveaway = () => {
    const giveawayData = {
      title: `FREE: ${analysis.item_analysis.item_name} - Giving away for free!`,
      description: `Free giveaway! This ${analysis.item_analysis.item_name} is in good condition and I'm giving it away for free. Perfect for someone who needs it.`,
      price: "0",
      currency: "THB",
      priceType: "Free",
      condition: analysis.listing_data.condition,
      category: analysis.listing_data.category,
      location: analysis.listing_data.location,
      fromLetGoBuddy: true,
      isGiveaway: true
    };

    navigate("/secondhand/submit-a-listing", {
      state: {
        prefillData: giveawayData,
        fromLetGoBuddy: true,
        isGiveaway: true
      }
    });
  };

  const addToChallenge = () => navigate('/let-go-buddy/challenge-calendar');
  const addToKeepBox = () => alert("Added to your 'Keep Box'.");

  return (
    <div className="w-full md:w-4/5 mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <SparklesIcon className="w-8 h-8 text-purple-600" />
          Analysis Complete!
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Here's what our AI discovered about your {analysis.item_analysis.item_name}
        </p>
      </div>

      {/* Item Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            Item Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg">{analysis.item_analysis.item_name}</h3>
              <p className="text-sm text-gray-600">Category: {analysis.item_analysis.item_category}</p>
              <p className="text-sm text-gray-600">Condition: {analysis.item_analysis.item_condition}</p>
              {analysis.item_analysis.brand && (
                <p className="text-sm text-gray-600">Brand: {analysis.item_analysis.brand}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Value: THB {analysis.item_analysis.current_value}</p>
              {analysis.item_analysis.original_price && (
                <p className="text-sm text-gray-600">Original Price: THB {analysis.item_analysis.original_price}</p>
              )}
              {analysis.item_analysis.condition_notes && (
                <p className="text-sm text-gray-600 mt-2">{analysis.item_analysis.condition_notes}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emotional Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="w-6 h-6 text-pink-600" />
            Emotional Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Attachment Level:</span>
            <Badge variant="secondary">{analysis.emotional_assessment.attachment_level}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Emotional Score:</span>
            <span className="font-semibold">{analysis.emotional_assessment.emotional_score}/10</span>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Emotional Tags:</p>
            <div className="flex gap-2 flex-wrap">
              {analysis.emotional_assessment.emotional_tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg">
            <p className="text-sm text-pink-800">{analysis.emotional_assessment.emotional_recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeAltIcon className="w-6 h-6 text-green-600" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>Impact Level:</span>
                <Badge variant={analysis.environmental_impact.impact_level === 'High' ? 'destructive' : 'secondary'}>
                  {analysis.environmental_impact.impact_level}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span>CO2 Savings:</span>
                <span className="font-semibold text-green-600">{analysis.environmental_impact.co2_impact} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recyclable:</span>
                <span className={analysis.environmental_impact.is_recyclable ? 'text-green-600' : 'text-red-600'}>
                  {analysis.environmental_impact.is_recyclable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>Sustainability Score:</span>
                <span className="font-semibold">{analysis.environmental_impact.sustainability_score}/10</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{analysis.environmental_impact.landfill_impact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            AI Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Recommended Action:</span>
            <Badge variant="default" className="text-lg px-3 py-1">{analysis.recommendation.action}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Confidence:</span>
            <span className="font-semibold">{analysis.recommendation.confidence}/10</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Why this recommendation?</h4>
            <p className="text-sm text-blue-700">{analysis.recommendation.reason}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Personal Advice</h4>
            <p className="text-sm text-purple-700">{analysis.recommendation.ai_suggestion}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>What would you like to do?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.recommendation.action === 'Sell' && (
            <div className="p-4 bg-green-50 rounded-lg mb-4">
              <h4 className="font-semibold text-green-800 mb-2">Ready-to-use Listing Data</h4>
              <p className="text-sm text-green-700 mb-2"><strong>Title:</strong> {analysis.listing_data.title}</p>
              <p className="text-sm text-green-700 mb-2"><strong>Suggested Price:</strong> THB {analysis.listing_data.price}</p>
              <p className="text-sm text-green-700"><strong>Description:</strong> {analysis.listing_data.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={handleStartSelling}
              variant={selectedAction === 'sell' ? 'default' : 'outline'}
              className="w-full"
            >
              Start Selling
            </Button>
            <Button 
              onClick={handleFreeGiveaway}
              variant={selectedAction === 'giveaway' ? 'default' : 'outline'}
              className="w-full flex items-center gap-2"
            >
              <GiftIcon className="w-4 h-4" />
              Free Giveaway
            </Button>
            <Button 
              onClick={addToKeepBox}
              variant={selectedAction === 'keep' ? 'default' : 'outline'}
              className="w-full"
            >
              Keep with Love
            </Button>
            <Button 
              onClick={addToChallenge}
              variant={selectedAction === 'challenge' ? 'default' : 'outline'}
              className="w-full"
            >
              Add to Challenge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" onClick={() => navigate('/let-go-buddy')}>
          Analyze Another Item
        </Button>
        <Button variant="outline" onClick={() => navigate('/secondhand')}>
          Browse Marketplace
        </Button>
      </div>
    </div>
  );
}
