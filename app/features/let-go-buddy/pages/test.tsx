

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Textarea } from "../../../common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { 
  CameraIcon, 
  SparklesIcon, 
  HeartIcon, 
  GiftIcon, 
  XMarkIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  LightBulbIcon as TipsIcon
} from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router";
import { EMOTIONAL_QUESTIONS, ENVIRONMENTAL_IMPACT, DECLUTTER_SITUATIONS } from '../constants';
import { getEnvironmentalImpactSummary, getLetGoBuddySessionsWithItems, getItemAnalysesDetailed } from '../queries';
import { Route } from './+types/let-go-buddy-page';
import { makeSSRClient } from "~/supa-client";

export async function loader({ request }: Route.LoaderArgs) {
  const { client, headers } = makeSSRClient(request);
  const [sessions, analyses, impact] = await Promise.all([
    getLetGoBuddySessionsWithItems(client),
    getItemAnalysesDetailed(client),
    getEnvironmentalImpactSummary(client)
  ]);
  return { sessions, analyses, impact };
}

export default function LetGoBuddyPage({ loaderData }: Route.ComponentProps) {
  const { sessions, analyses, impact } = loaderData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentLocation = searchParams.get("location") || "Bangkok";
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [showListing, setShowListing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showEmotionalAssessment, setShowEmotionalAssessment] = useState(false);
  const [showCostBenefit, setShowCostBenefit] = useState(false);
  const [showEnvironmentalImpact, setShowEnvironmentalImpact] = useState(false);
  const [showKeepMessage, setShowKeepMessage] = useState(false);
  const [showGiveawayMessage, setShowGiveawayMessage] = useState(false);
  const [keepMessage, setKeepMessage] = useState<string>("");
  const [giveawayMessage, setGiveawayMessage] = useState<string>("");
  const [emotionalAnswers, setEmotionalAnswers] = useState<number[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [itemDetails, setItemDetails] = useState({
    usagePeriod: "",
    pros: "",
    cons: ""
  });

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 5) {
      alert("You can upload maximum 5 files");
      return;
    }

    // MIME 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => 
      !allowedTypes.includes(file.type)
    );
    
    if (invalidFiles.length > 0) {
      const invalidTypes = invalidFiles.map(file => file.type).join(", ");
      alert(`Invalid file type(s): ${invalidTypes}. Only JPEG, PNG, and WebP images are allowed.`);
      return;
    }

    // 파일 크기 검증
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => 
      file.size > maxFileSize
    );
    
    if (oversizedFiles.length > 0) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      alert(`File(s) too large. Maximum file size is ${maxSizeMB}MB.`);
      return;
    }
    
    setUploadedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Handle emotional assessment
  const handleEmotionalAssessment = () => {
    setShowEmotionalAssessment(true);
    setEmotionalAnswers(new Array(EMOTIONAL_QUESTIONS.length).fill(0));
  };

  // Handle emotional answer change
  const handleEmotionalAnswerChange = (questionIndex: number, value: number) => {
    const newAnswers = [...emotionalAnswers];
    newAnswers[questionIndex] = value;
    setEmotionalAnswers(newAnswers);
  };

  // Calculate emotional score
  const calculateEmotionalScore = () => {
    const total = emotionalAnswers.reduce((sum, answer) => sum + answer, 0);
    return Math.round((total / (EMOTIONAL_QUESTIONS.length * 5)) * 100);
  };

  // Handle cost-benefit analysis
  const handleCostBenefitAnalysis = () => {
    setShowCostBenefit(true);
  };

  // Handle environmental impact
  const handleEnvironmentalImpact = () => {
    setShowEnvironmentalImpact(true);
  };

  // Handle navigation to submit listing page
  const handlePostAfterEditing = () => {
    if (selectedItem) {
      // Prepare the data to pass to submit-a-listing-page
      const listingData = {
        title: selectedItem.aiListing.title,
        description: selectedItem.aiListing.desc,
        price: selectedItem.aiListing.price,
        location: currentLocation,
        images: uploadedFiles, // Pass the uploaded images
        category: selectedItem.category || "Electronics",
        condition: "Used - Good",
        aiGenerated: true,
        originalItem: selectedItem
      };

      // Navigate to submit-a-listing-page with the data
      const targetUrl = currentLocation && currentLocation !== "Bangkok" 
        ? `/secondhand/submit-a-listing?location=${currentLocation}`
        : "/secondhand/submit-a-listing";
      
      navigate(targetUrl, { 
        state: { 
          prefillData: listingData,
          fromLetGoBuddy: true 
        } 
      });
      
      // Close the popup
      setShowListing(false);
    }
  };

  // Handle generating another AI suggestion
  const handleSeeAnotherSuggestion = () => {
    if (selectedItem) {
      // Generate alternative suggestions based on user input
      let alternativeSuggestions = [
        {
          title: `${selectedItem.name} – Excellent condition, ready to use!`,
          desc: "Well-maintained item in great shape. Perfect for daily use or as a gift.",
          price: "THB 300",
          location: currentLocation,
        },
        {
          title: `${selectedItem.name} – Bargain price for quick sale!`,
          desc: "Selling at a great price to make room. Still works perfectly, just need space.",
          price: "THB 180",
          location: currentLocation,
        },
        {
          title: `${selectedItem.name} – Premium quality, barely used!`,
          desc: "High-quality item with minimal wear. Like new condition, great value.",
          price: "THB 350",
          location: currentLocation,
        },
        {
          title: `${selectedItem.name} – Perfect for students or budget-conscious buyers!`,
          desc: "Affordable option that doesn't compromise on quality. Great for those on a budget.",
          price: "THB 220",
          location: currentLocation,
        }
      ];

      // Enhance suggestions based on user input
      if (itemDetails.pros) {
        alternativeSuggestions.unshift({
          title: `${selectedItem.name} – ${itemDetails.pros.split(',')[0].trim()}!`,
          desc: `This item has ${itemDetails.pros.toLowerCase()}. ${itemDetails.usagePeriod ? `Used for ${itemDetails.usagePeriod.replace(/-/g, ' ')}.` : ''} Great value for someone who appreciates quality.`,
          price: "THB 280",
          location: currentLocation,
        });
      }

      if (itemDetails.cons) {
        alternativeSuggestions.push({
          title: `${selectedItem.name} – Honest condition, great price!`,
          desc: `Transparent about condition: ${itemDetails.cons.toLowerCase()}. Still functional and priced accordingly. Perfect for someone who doesn't mind minor imperfections.`,
          price: "THB 150",
          location: currentLocation,
        });
      }

      // Randomly select a new suggestion
      const randomIndex = Math.floor(Math.random() * alternativeSuggestions.length);
      const newSuggestion = alternativeSuggestions[randomIndex];

      // Update the selected item with new AI suggestion
      setSelectedItem({
        ...selectedItem,
        aiListing: newSuggestion
      });
    }
  };

  // Handle free giveaway navigation
  const handleFreeGiveaway = () => {
    if (selectedItem) {
      // Prepare free giveaway data
      const giveawayData = {
        title: `FREE: ${selectedItem.name} - Giving away for free!`,
        description: `Free giveaway! This ${selectedItem.name} is in good condition and I'm giving it away for free. Perfect for someone who needs it. Please contact me if you're interested.`,
        price: "THB 0",
        location: currentLocation,
        images: uploadedFiles,
        category: selectedItem.category || "Electronics",
        condition: "Used - Good",
        aiGenerated: true,
        isGiveaway: true,
        originalItem: selectedItem
      };

      // Navigate to submit-a-listing-page with free giveaway data
      const targetUrl = currentLocation && currentLocation !== "Bangkok" 
        ? `/secondhand/submit-a-listing?location=${currentLocation}`
        : "/secondhand/submit-a-listing";
      
      navigate(targetUrl, { 
        state: { 
          prefillData: giveawayData,
          fromLetGoBuddy: true,
          isGiveaway: true
        } 
      });
      
      // Close the popup
      setShowListing(false);
      setShowGiveawayMessage(false);
    }
  };

  // Generate AI message for keeping item
  const generateKeepMessage = (itemName: string, situation: string) => {
    let baseMessages = [
      `Sometimes the most beautiful decluttering decision is to keep what truly matters. Your ${itemName} might be holding memories that are worth more than any space it takes up.`,
      `In a world that moves so fast, holding onto things that bring you comfort isn't clutter—it's self-care. Your ${itemName} might be exactly what you need on a difficult day.`,
      `The best decluttering advice? Keep what makes you smile. Your ${itemName} seems to have found a special place in your heart, and that's perfectly okay.`,
      `You're ${situation.toLowerCase()}, but remember: not everything needs to go. Your ${itemName} might be the one thing you'd regret letting go of.`,
      `Sometimes the most sustainable choice is to keep and cherish. Your ${itemName} has already been made, so loving it longer is actually the most eco-friendly decision.`
    ];

    // Enhance message based on user input
    if (itemDetails.pros) {
      const prosMessages = [
        `I can see from your input that you really appreciate ${itemDetails.pros.toLowerCase()}. These qualities make your ${itemName} special and worth holding onto.`,
        `Your mention of ${itemDetails.pros.toLowerCase()} shows this ${itemName} has real value to you. Sometimes the best decluttering decision is to keep what genuinely serves you.`,
        `The fact that you highlighted ${itemDetails.pros.toLowerCase()} suggests this ${itemName} brings you genuine joy or utility. That's exactly the kind of item worth keeping.`
      ];
      baseMessages = [...prosMessages, ...baseMessages];
    }

    if (itemDetails.usagePeriod && itemDetails.usagePeriod.includes('less-than-1-year')) {
      baseMessages.unshift(`Since you've only had this ${itemName} for a short time, you might want to give it a bit longer to see if it truly fits your life. New items often need time to find their place.`);
    }

    return baseMessages[Math.floor(Math.random() * baseMessages.length)];
  };

  // Generate AI message for free giveaway
  const generateGiveawayMessage = (itemName: string, situation: string) => {
    let baseMessages = [
      `Your generosity with this ${itemName} will create ripples of kindness in your community. Someone's day is about to be brightened by your thoughtful gesture.`,
      `By giving away your ${itemName}, you're not just decluttering—you're creating space for new possibilities while giving someone else a chance to discover something they need.`,
      `The beauty of letting go is that it often leads to the most unexpected connections. Your ${itemName} might become someone else's treasure, creating a story you'll never know but will have started.`,
      `As you're ${situation.toLowerCase()}, remember that your ${itemName} can have a second life with someone who will appreciate it just as much as you once did.`,
      `Your decision to give away this ${itemName} shows that you understand the true value of things—not in what they cost, but in the joy they can bring to others.`
    ];

    // Enhance message based on user input
    if (itemDetails.pros) {
      const prosMessages = [
        `Even though you mentioned ${itemDetails.pros.toLowerCase()}, your willingness to share this ${itemName} shows incredible generosity. Someone else will surely appreciate these same qualities.`,
        `Your ${itemName} has ${itemDetails.pros.toLowerCase()}, making it perfect for someone who needs exactly those features. Your generosity will make a real difference.`
      ];
      baseMessages = [...prosMessages, ...baseMessages];
    }

    if (itemDetails.cons) {
      const consMessages = [
        `By addressing your concerns about ${itemDetails.cons.toLowerCase()}, you're making space for what truly serves you while giving someone else a chance to find value in this ${itemName}.`,
        `Your honesty about ${itemDetails.cons.toLowerCase()} shows self-awareness. Someone else might not have the same concerns and could find this ${itemName} perfect for their needs.`
      ];
      baseMessages = [...consMessages, ...baseMessages];
    }

    if (itemDetails.usagePeriod && itemDetails.usagePeriod.includes('more-than-2-years')) {
      baseMessages.unshift(`After ${itemDetails.usagePeriod.replace(/-/g, ' ')} of use, your ${itemName} has served you well. Now it's time to let it serve someone else and create new memories.`);
    }

    return baseMessages[Math.floor(Math.random() * baseMessages.length)];
  };

  // Handle keep with love
  const handleKeepWithLove = (item: any) => {
    const message = generateKeepMessage(item.name, selectedSituation || "");
    setKeepMessage(message);
    setShowKeepMessage(true);
  };

  // Handle popup close with completion
  const handlePopupClose = (actionType: string, itemName: string) => {
    setCompletedActions(prev => new Set([...prev, `${actionType}-${itemName}`]));
    setShowCompletionMessage(true);
    
    // Hide completion message after 3 seconds
    setTimeout(() => {
      setShowCompletionMessage(false);
    }, 3000);
  };

  // Handle giveaway start
  const handleGiveawayStart = (item: any) => {
    const message = generateGiveawayMessage(item.name, selectedSituation || "");
    setGiveawayMessage(message);
    setShowGiveawayMessage(true);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      {/* Title & Subtitle */}
      <h1 className="text-4xl font-bold text-center mb-2">Let Go Buddy</h1>
      <p className="text-center text-lg mb-1">Declutter smarter, not harder.</p>
      <p className="text-center text-md mb-8 text-gray-600">
        Let AI help you decide what to sell, donate, or keep — starting with photo.
      </p>

      {/* Step 1: Upload */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="w-6 h-6 text-blue-600" />
            Upload your items
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-gray-500 mb-4">Upload 1–5 photos of the item you want to declutter.</p>
          
          {/* Photo tips */}
          <div className="bg-purple-50 border border-primary/20 rounded-lg p-4 mb-4 w-full">
            <div className="font-medium text-primary-foreground mb-2">Tips for better AI analysis</div>
            <ul className="text-sm text-primary-foreground/80 space-y-1">
              <li>• Take photos from different angles (front, back, sides)</li>
              <li>• Include close-ups of any damage or wear</li>
              <li>• Show brand names and model numbers clearly</li>
              <li>• Ensure good lighting for clear visibility</li>
              <li>• Include the item in context (e.g., size reference)</li>
            </ul>
          </div>

          {/* Item Details Form */}
          <div className="w-full space-y-4 mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Tell us more about your item (optional but helpful for better analysis)</div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  How long have you used this item?
                </div>
                <Select value={itemDetails.usagePeriod} onValueChange={(value) => setItemDetails(prev => ({ ...prev, usagePeriod: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select usage period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-1-month">Less than 1 month</SelectItem>
                    <SelectItem value="1-6-months">1-6 months</SelectItem>
                    <SelectItem value="6-months-1-year">6 months - 1 year</SelectItem>
                    <SelectItem value="1-2-years">1-2 years</SelectItem>
                    <SelectItem value="2-5-years">2-5 years</SelectItem>
                    <SelectItem value="more-than-5-years">More than 5 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  What do you like about this item? (pros)
                </div>
                <Textarea 
                  value={itemDetails.pros}
                  onChange={(e) => setItemDetails(prev => ({ ...prev, pros: e.target.value }))}
                  placeholder="e.g., Still works perfectly, great quality, sentimental value..."
                  className="resize-none"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  What concerns you about this item? (cons)
                </div>
                <Textarea 
                  value={itemDetails.cons}
                  onChange={(e) => setItemDetails(prev => ({ ...prev, cons: e.target.value }))}
                  placeholder="e.g., Takes up space, rarely used, minor scratches..."
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          {/* Hidden file input */}
          <Input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="file-upload"
            onChange={handleFileUpload}
          />
          
          {/* Upload button */}
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="mb-4"
          >
            Choose Files
          </Button>
          
          {/* Preview images or placeholder */}
          <div className="flex flex-wrap gap-2 justify-center mt-4 w-full">
            {previewUrls.length > 0 ? (
              previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="w-24 h-24 object-cover rounded" 
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                Click to upload images
              </div>
            )}
          </div>
          
          {/* Image count */}
          {previewUrls.length > 0 && (
            <span className="text-xs text-neutral-500 mt-2">{previewUrls.length}/5 images</span>
          )}
          <span className="text-xs text-gray-400 mt-1">
            Supported formats: JPEG, PNG, WebP (max 10MB each)
          </span>
        </CardContent>
      </Card>

      {/* Step 2: Situation Selection */}
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">Step 2</div>
        <div className="mb-2">Select your current situation</div>
        <div className="flex flex-wrap gap-3 mb-4">
          {DECLUTTER_SITUATIONS.map((s) => (
            <Button
              key={s.value}
              variant={selectedSituation === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSituation(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
        
        {/* Generate AI Analysis Button */}
        <Button 
          disabled={!selectedSituation || uploadedFiles.length === 0}
          className="w-full"
          size="lg"
        >
          <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
          Generate AI Analysis
        </Button>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="px-6 py-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200"
          onClick={() => navigate("/secondhand/browse-listings")}
        >
          <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
          Browse Items
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="px-6 py-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200"
          onClick={() => navigate("/community/local-tips")}
        >
          <TipsIcon className="w-4 h-4 mr-2" />
          Get Tips
        </Button>
      </div>

    </div>
  );
} 



/////////////////////////////////////
import OpenAI from "openai";
import { makeSSRClient } from "~/supa-client";
import { Route } from "./+types/let-go-buddy-analysis-page";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 분석 결과 타입 정의
interface AnalysisResult {
  item_name: string;
  item_category: string;
  recommendation: string;
  ai_listing_title: string;
  ai_listing_description: string;
  ai_listing_price: number;
  environmental_impact: string;
  emotional_consideration: string;
  condition_assessment: string;
  market_demand: string;
}

// 상황별 프롬프트 템플릿
const getSituationPrompt = (situation: string) => {
  const situationPrompts: Record<string, string> = {
    "Moving": "The user is moving and needs to declutter quickly. Focus on items that can be sold quickly or donated.",
    "Minimalism": "The user is embracing minimalism. Focus on items that truly add value to their life.",
    "Spring Cleaning": "The user is doing a spring cleaning. Focus on items that no longer serve their current lifestyle.",
    "Other": "The user wants to declutter. Provide balanced advice."
  };
  return situationPrompts[situation] || "The user wants to declutter. Provide balanced advice.";
};

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const body = await request.json();
    const situation = body.situation || "general";
    const usagePeriod = body.usagePeriod || "";
    const pros = body.pros || "";
    const cons = body.cons || "";
    const imageUrls = body.images || [];

    if (!imageUrls || imageUrls.length === 0) {
      return Response.json({ 
        error: "No images provided for analysis" 
      }, { status: 400 });
    }

    // 이미지 URL들을 OpenAI 형식으로 변환
    const imageContents = imageUrls.map((url: string) => ({
      type: "image_url" as const,
      image_url: {
        url: url
      }
    }));

    // 상황별 프롬프트 생성
    const situationPrompt = getSituationPrompt(situation);
    
    // 사용자 입력 정보를 포함한 프롬프트
    const userInputInfo = [
      usagePeriod && `Usage period: ${usagePeriod}`,
      pros && `Pros: ${pros}`,
      cons && `Cons: ${cons}`
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are a decluttering expert and AI assistant helping users make informed decisions about their items. 

Your task is to analyze the item in the image and provide comprehensive recommendations for decluttering.

${situationPrompt}

Please provide your analysis in the following JSON format:
{
  "item_name": "Clear, descriptive name of the item",
  "item_category": "Electronics/Clothing/Furniture/Books/Kitchen/Other",
  "recommendation": "sell/donate/keep/recycle/repair",
  "ai_listing_title": "Compelling title for marketplace listing (max 60 chars)",
  "ai_listing_description": "Detailed description highlighting key features and condition (max 200 chars)",
  "ai_listing_price": estimated_price_in_thb,
  "environmental_impact": "Brief environmental impact assessment",
  "emotional_consideration": "Consideration of sentimental value",
  "condition_assessment": "Honest assessment of item condition",
  "market_demand": "Assessment of current market demand"
}

Guidelines:
- Be honest about condition and realistic about pricing
- Consider the user's situation and emotional attachment
- Provide environmentally conscious recommendations
- Price should be competitive for the Thai market (THB)
- Focus on practical, actionable advice

User Input:
${userInputInfo}`;

    const userPrompt = `Please analyze this item for decluttering purposes. Consider the user's situation and provide detailed recommendations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            ...imageContents
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    // JSON 파싱
    let analysisResult: AnalysisResult;
    try {
      analysisResult = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseContent);
      throw new Error("Invalid response format from AI");
    }

    // 환경적 영향 계산 (추가)
    const environmentalScore = calculateEnvironmentalScore(analysisResult.recommendation);
    
    // 감정적 점수 계산 (추가)
    const emotionalScore = calculateEmotionalScore(pros, cons);

    // Supabase 클라이언트 생성
    const { client } = makeSSRClient(request);

    // 분석 결과를 데이터베이스에 저장하지 않음
    // 세션 생성과 분석 결과 저장은 메인 페이지에서 처리됨
    console.log("Analysis completed, saving will be handled by main page");

    return Response.json({
      success: true,
      analysis: {
        ...analysisResult,
        environmental_score: environmentalScore,
        emotional_score: emotionalScore,
        situation: situation,
        usage_period: usagePeriod,
        pros: pros,
        cons: cons
      }
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json({ 
      error: "Failed to analyze item",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};

// 환경적 영향 점수 계산
function calculateEnvironmentalScore(recommendation: string): number {
  const scores: Record<string, number> = {
    "donate": 90,
    "sell": 80,
    "recycle": 85,
    "repair": 75,
    "keep": 60
  };
  return scores[recommendation] || 50;
}

// 감정적 점수 계산
function calculateEmotionalScore(pros: string, cons: string): number {
  let score = 50; // 기본 점수
  
  if (pros) {
    const positiveKeywords = ["love", "sentimental", "memory", "gift", "special", "important"];
    const prosLower = pros.toLowerCase();
    positiveKeywords.forEach(keyword => {
      if (prosLower.includes(keyword)) score += 10;
    });
  }
  
  if (cons) {
    const negativeKeywords = ["hate", "never use", "regret", "waste", "useless"];
    const consLower = cons.toLowerCase();
    negativeKeywords.forEach(keyword => {
      if (consLower.includes(keyword)) score -= 10;
    });
  }
  
  return Math.max(0, Math.min(100, score));
}

// 기본 페이지 컴포넌트 (필요시)
export default function LetGoBuddyAnalysisPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Let Go Buddy Analysis</h1>
      <p className="text-gray-600">
        This page handles AI analysis requests. Use the main Let Go Buddy page to upload images and trigger analysis.
      </p>
    </div>
  );
}
