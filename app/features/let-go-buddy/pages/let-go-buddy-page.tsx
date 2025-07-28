import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Textarea } from "../../../common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { 
  CameraIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  HeartIcon, 
  GiftIcon, 
  XMarkIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  LightBulbIcon as TipsIcon
} from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router";
import { EMOTIONAL_QUESTIONS, DECLUTTER_SITUATIONS } from '../constants';
import { uploadLetGoBuddyImages, createLetGoBuddySession } from '../mutations';
import { makeSSRClient, browserClient } from "~/supa-client";
import { Route } from './+types/let-go-buddy-page';
import { useEffect } from "react";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  let canUseLetGoBuddy = true;
  if (user) {
    const { count } = await client
      .from('let_go_buddy_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if (typeof count === 'number' && count >= 2) {
      canUseLetGoBuddy = false;
    }
  }
  return { user, canUseLetGoBuddy };
};

export default function LetGoBuddyPage({ loaderData }: Route.ComponentProps) {
  const { user, canUseLetGoBuddy } = loaderData || { user: null, canUseLetGoBuddy: true };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentLocation = searchParams.get("location") || "Bangkok";
  const [step, setStep] = useState(1);
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [showListing, setShowListing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
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
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file, idx) => {
      console.log(`파일 ${idx + 1} 이름:`, file.name, "타입:", file.type);
    });
    if (files.length > 5) {
      alert("You can upload maximum 5 files");
      return;
    }
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic', // HEIC 추가
      'image/heif', // HEIF 추가 (일부 기기용)
      '',
    ];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      const invalidTypes = invalidFiles.map(file => file.type).join(", ");
      alert(`Invalid file type(s): ${invalidTypes}. Only JPEG, PNG, WebP, HEIC, and HEIF images are allowed.`);
      return;
    }
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      alert(`File(s) too large. Maximum file size is ${maxSizeMB}MB.`);
      return;
    }
    setUploadedFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // 분석 요청 및 결과 반영
  const handleGenerateAnalysis = async () => {
    if (!canUseLetGoBuddy) {
      alert("You have used all your free Let Go Buddy sessions (2/2). Upgrade your trust level to use more!");
      return;
    }
    if (!selectedSituation) {
      alert("Please select your situation first");
      return;
    }
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one image first");
      return;
    }
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalyses([]);
    try {
      // 1. 이미지 업로드
      const imageUrls = await uploadLetGoBuddyImages(browserClient, { userId: (user as any).id, images: uploadedFiles });
      // 2. 세션 생성
      const { session_id } = await createLetGoBuddySession(browserClient, { userId: (user as any).id, situation: selectedSituation });
      // 3. AI 분석 요청
      const res = await fetch(
        `/let-go-buddy/analysis?sessionId=${session_id}&imageUrls=${encodeURIComponent(JSON.stringify(imageUrls))}&situation=${encodeURIComponent(selectedSituation)}`,
        { method: 'GET' }
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "AI 분석 실패");
      setAnalyses([data.analysis]);
      setAnalysisComplete(true);
      setCurrentItemIndex(0);
      setTimeout(() => {
        const analysisSection = document.getElementById('analysis-results');
        if (analysisSection) {
          analysisSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
      alert(err.message || "분석 중 오류 발생");
    } finally {
      setIsAnalyzing(false);
    }
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
        price: selectedItem.aiListing.price.replace('THB ', ''), // Remove 'THB ' prefix
        currency: "THB",
        priceType: "Fixed",
        location: currentLocation,
        images: uploadedFiles, // Pass the uploaded images
        category: selectedItem.category || "Electronics",
        condition: "Used - Good",
        aiGenerated: true,
        originalItem: selectedItem,
        fromLetGoBuddy: true
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
        price: "0",
        currency: "THB",
        priceType: "Free",
        location: currentLocation,
        images: uploadedFiles,
        category: selectedItem.category || "Electronics",
        condition: "Used - Good",
        aiGenerated: true,
        isGiveaway: true,
        originalItem: selectedItem,
        fromLetGoBuddy: true
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

  const currentItem = analyses.length > 0 && analyses[currentItemIndex] ? {
    ...analyses[currentItemIndex],
    name: analyses[currentItemIndex].item_name,
    photo: previewUrls.length > 0 ? previewUrls[0] : '/sample.png',
    category: analyses[currentItemIndex].item_category,
    recommendation: analyses[currentItemIndex].recommendation,
    aiListing: {
      title: analyses[currentItemIndex].ai_listing_title || `${analyses[currentItemIndex].item_name} - Great condition!`,
      desc: analyses[currentItemIndex].ai_listing_description ?? `Well-maintained ${analyses[currentItemIndex].item_name} in good condition.`,
      price: analyses[currentItemIndex].ai_listing_price ? `THB ${analyses[currentItemIndex].ai_listing_price}` : 'THB 250',
      location: currentLocation,
    }
  } as any : null;

  return (
    <div className="w-full md:w-4/5 mx-auto px-5 py-6 md:py-6 space-y-6">
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
            Supported formats: JPEG, PNG, WebP, HEIC (max 10MB each)
            <br />
            <span className="text-[11px] text-gray-500">
              * HEIC/HEIF images are supported for upload, but may not preview correctly in your browser.  
              They will be automatically converted for compatibility after upload.
            </span>
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
          onClick={() => {
            if (!canUseLetGoBuddy) return;
            handleGenerateAnalysis();
            // Scroll to analyzing section immediately
            setTimeout(() => {
              const analyzingSection = document.getElementById('analyzing-section');
              if (analyzingSection) {
                analyzingSection.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
              }
            }, 100);
          }}
          disabled={!canUseLetGoBuddy || !selectedSituation || uploadedFiles.length === 0 || isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin text-blue-600" />
              Generating AI Analysis...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
              Generate AI Analysis
            </>
          )}
        </Button>
        {!canUseLetGoBuddy && (
          <div className="text-sm mt-2 text-center bg-emerald-50 text-emerald-700 rounded-md px-4 py-2 border border-emerald-100">
            😊 You’ve used all your free Let Go Buddy sessions (2/2). If you’d like to use more, please build trust in the community or contact us!
          </div>
        )}
      </div>

      {/* Step 3: Analyzing */}
      {isAnalyzing && (
        <div id="analyzing-section" className="mb-8">
          <div className="font-semibold text-lg mb-2">Step 3</div>
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />
            Analyzing your items...
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Our AI is examining your photos and situation to provide personalized recommendations...
          </div>
        </div>
      )}

      {/* Analysis Result Cards */}
      {analysisComplete && (
        <div id="analysis-results" className="space-y-6 mb-12">
          <div className="font-semibold text-lg mb-4">Analysis Complete!</div>
          
          {/* Progress Summary */}
          {completedActions.size > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                <div className="font-semibold text-gray-800">Your Progress</div>
              </div>
              <div className="text-sm text-gray-600">
                You've made {completedActions.size} decision{completedActions.size > 1 ? 's' : ''} so far. 
                {completedActions.size === 1 && " Great start!"}
                {completedActions.size > 1 && " You're doing great!"}
              </div>
            </div>
          )}
          {currentItem && (
            <>
              {/* Item Navigation */}
              {analyses.length > 1 && (
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentItemIndex(Math.max(0, currentItemIndex - 1))}
                    disabled={currentItemIndex === 0}
                  >
                    ← Previous Item
                  </Button>
                  <span className="text-sm text-gray-600">
                    Item {currentItemIndex + 1} of {analyses.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentItemIndex(Math.min(analyses.length - 1, currentItemIndex + 1))}
                    disabled={currentItemIndex === analyses.length - 1}
                  >
                    Next Item →
                  </Button>
                </div>
              )}
              
              <div className={`bg-white border rounded-xl p-5 shadow-sm relative ${
                completedActions.has(`keep-${currentItem.name}`) ? 'ring-2 ring-green-200 bg-green-50/30' : ''
              }`}>
              {completedActions.has(`keep-${currentItem.name}`) && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              )}
              <div className="w-full">
                <div className="font-semibold text-lg mb-1">Photo: {currentItem.name}</div>
                <div className="text-gray-600 mb-1">Recognition: <span className="font-medium">"{currentItem.name}"</span></div>
                <div className="mb-2">Recommendation: <span className="font-medium">{currentItem.recommendation}</span></div>
                {currentItem.recommendation_reason && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-sm font-medium text-blue-800 mb-1">Why this recommendation?</div>
                    <div className="text-xs text-blue-700 leading-relaxed">{currentItem.recommendation_reason}</div>
                  </div>
                )}
                
                {/* User Provided Details */}
                {(itemDetails.usagePeriod || itemDetails.pros || itemDetails.cons) && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-sm font-medium text-blue-800 mb-2">Your Input Analysis</div>
                    {itemDetails.usagePeriod && (
                      <div className="text-xs text-blue-700 mb-1">
                        <span className="font-medium">Usage:</span> {itemDetails.usagePeriod.replace(/-/g, ' ')}
                      </div>
                    )}
                    {itemDetails.pros && (
                      <div className="text-xs text-green-700 mb-1">
                        <span className="font-medium">Pros:</span> {itemDetails.pros}
                      </div>
                    )}
                    {itemDetails.cons && (
                      <div className="text-xs text-orange-700">
                        <span className="font-medium">Cons:</span> {itemDetails.cons}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Decision Helper Buttons */}
                <div className="flex gap-2 flex-wrap mb-3">
                  <Button
                    size="sm"
                    variant={selectedAction === 'create' ? 'default' : 'outline'}
                    onClick={() => { setShowListing(true); setSelectedItem(currentItem); setSelectedAction('create'); }}
                  >
                    Start Selling
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAction === 'keep' ? 'default' : 'outline'}
                    onClick={() => { handleKeepWithLove(currentItem); setSelectedAction('keep'); }}
                    className={completedActions.has(`keep-${currentItem.name}`) ? 'bg-green-100 text-green-700 border-green-300' : ''}
                  >
                    {completedActions.has(`keep-${currentItem.name}`) ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Kept with Love
                      </>
                    ) : (
                      'Keep with Love'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAction === 'giveaway' ? 'default' : 'outline'}
                    onClick={() => { handleGiveawayStart(currentItem); setSelectedItem(currentItem); setSelectedAction('giveaway'); }}
                  >
                    Free Giveaway
                  </Button>
                </div>

                {/* Decision Helper Tools */}
                <div className="text-sm text-gray-600 mb-2">Still unsure? Try these decision helpers:</div>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEmotionalAssessment}
                    className="text-xs"
                  >
                    Emotional Check
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEnvironmentalImpact}
                    className="text-xs"
                  >
                    Eco Impact
                  </Button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      )}

      {/* AI Generated Listing Popup */}
      {showListing && selectedItem && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100">
            <button className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full" onClick={() => { setShowListing(false); setSelectedAction(null); }}>
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
            <div className="mb-6 text-xl font-semibold text-gray-800 flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
              AI Generated Listing
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedItem.aiListing.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedItem.aiListing.desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Suggested Price</div>
                  <div className="font-semibold text-green-600">Preparing...</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-semibold text-gray-800">{selectedItem.aiListing.location}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handlePostAfterEditing}
              >
                Post after editing
              </Button>
              <Button 
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 font-medium transition-all duration-200"
                onClick={handleSeeAnotherSuggestion}
              >
                See another suggestion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Emotional Assessment Popup */}
      {showEmotionalAssessment && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full relative shadow-2xl border border-gray-100 max-h-[80vh] overflow-y-auto">
            <button className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full" onClick={() => setShowEmotionalAssessment(false)}>
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
            <div className="mb-6 text-xl font-semibold text-gray-800 flex items-center gap-3">
              <HeartIcon className="w-6 h-6 text-pink-600" />
              Emotional Attachment Assessment
            </div>
            <div className="space-y-4">
              {EMOTIONAL_QUESTIONS.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-medium mb-3">{question}</div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleEmotionalAnswerChange(index, value)}
                        className={`px-3 py-1 rounded text-sm ${
                          emotionalAnswers[index] === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">1 = Not at all, 5 = Very much</div>
                </div>
              ))}
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                <div className="font-semibold text-gray-800 mb-2">Emotional Attachment Score: <span className="text-blue-600">{calculateEmotionalScore()}%</span></div>
                <div className="text-sm text-gray-600">
                  {calculateEmotionalScore() > 70 ? "High attachment - Consider keeping" :
                  calculateEmotionalScore() > 40 ? "Moderate attachment - Think carefully" :
                  "Low attachment - Safe to let go"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Environmental Impact Popup */}
      {showEnvironmentalImpact && (
        <div className="fixed inset-0 bg-primary/2 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative shadow-lg">
            <button className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full" onClick={() => setShowEnvironmentalImpact(false)}>
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
            <div className="mb-6 text-lg font-bold flex items-center gap-2">Environmental Impact</div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-medium mb-2">By donating/selling this item:</div>
                <div className="text-sm space-y-1">
                  <div>• Saves co2 kg CO2 emissions</div>
                  <div>• Reduces landfill waste</div>
                  <div>• Extends item's useful life</div>
                  <div>• Supports circular economy</div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium mb-2">Best disposal method:</div>
                <div className="text-sm">
                  {"♻️ Recycle or donate to extend life"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keep with Love Message Popup */}
      {showKeepMessage && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100 text-center">
            <button className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full" onClick={() => { setShowKeepMessage(false); setSelectedAction(null); }}>
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-4">
                <HeartIcon className="w-8 h-8 text-pink-600" />
              </div>
              <div className="text-2xl font-bold mb-2 text-gray-800">Keep with Love</div>
              <div className="text-sm text-gray-500">Sometimes the best choice is to cherish what matters</div>
            </div>
            <div className="space-y-6 mb-8 text-left">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100 shadow-sm">
                <div className="text-sm font-medium text-pink-700 mb-3 uppercase tracking-wide">A personal message for you</div>
                <div className="text-gray-700 leading-relaxed italic">
                  "{keepMessage}"
                </div>
              </div>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
              onClick={() => { 
                setShowKeepMessage(false); 
                setSelectedAction(null);
                handlePopupClose('keep', selectedItem?.name || 'item');
              }}
            >
              Thank you for the reminder
            </Button>
          </div>
        </div>
      )}

      {/* Free Giveaway Message Popup */}
      {showGiveawayMessage && selectedItem && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100 text-center">
            <button className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full" onClick={() => { setShowGiveawayMessage(false); setSelectedAction(null); }}>
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-4">
                <GiftIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold mb-2 text-gray-800">Free Giveaway</div>
              <div className="text-sm text-gray-500">Spread kindness and make someone's day</div>
            </div>
            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm">
                <div className="text-sm font-medium text-green-700 mb-3 uppercase tracking-wide">A personal message for you</div>
                <div className="text-gray-700 leading-relaxed italic">
                  "{giveawayMessage}"
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="text-sm text-blue-800 font-medium">
                  Ready to share your generosity?<br/>
                  <span className="text-blue-600">Let's create a free giveaway post for the community!</span>
                </div>
              </div>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
              onClick={() => {
                setShowGiveawayMessage(false);
                setSelectedAction(null);
                handleFreeGiveaway();
              }}
            >
              Share the love with a free giveaway
            </Button>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {showCompletionMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white rounded-xl p-4 shadow-2xl border border-green-200 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">Decision Made!</div>
                <div className="text-sm text-gray-600">You've completed this step successfully.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Guidance */}
      {analysisComplete && (
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="font-semibold text-gray-800 mb-2">What's Next?</div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Make decisions for each item using the buttons above</div>
              <div>• Use the decision helpers if you're unsure</div>
              <div>• Once you've decided on all items, you're all set!</div>
            </div>
            {completedActions.size > 0 && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <div className="text-sm font-medium text-green-800">
                  🎉 You've completed {completedActions.size} decision{completedActions.size > 1 ? 's' : ''}!
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          Try another item
        </Button>
      </div>

    </div>
  );
} 