import { useState, useCallback, useEffect } from "react";
import { useFetcher, useNavigate, redirect } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { CameraIcon, ArrowPathIcon, SparklesIcon, GiftIcon } from "@heroicons/react/24/outline";
import { AlertTriangle } from "lucide-react";
import { createLetGoBuddySession } from "../mutations";
import { makeSSRClient } from "~/supa-client";
import { DECLUTTER_SITUATIONS } from '../constants';
import { productCategories } from "~/schema";
import AICoachChat from '../components/AICoachChat';

export async function loader({ request }: { request: Request }) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    const url = new URL(request.url);
    return redirect(`/auth/login?redirectTo=${url.pathname}`);
  }
  
  // Simple usage check - count ALL sessions (completed or not)
  const { count } = await client
    .from('let_go_buddy_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  const usageCount = count || 0;
  const canUseLetGoBuddy = usageCount < 2; // Allow 0 and 1, block at 2+
  
  return { user, canUseLetGoBuddy, usageCount };
}


export async function action({ request }: { request: Request }) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }
  
  try {
    const contentType = request.headers.get('content-type') || '';
    let intent: string;
    
    // Handle JSON requests (for session completion)
    if (contentType.includes('application/json')) {
      const jsonData = await request.json();
      intent = jsonData.intent;
      
      if (intent === 'markSessionComplete') {
        const { markSessionCompleted } = await import("../mutations");
        const sessionId = parseInt(jsonData.sessionId);
        
        if (!sessionId) {
          return Response.json({ error: "Session ID is required" }, { status: 400 });
        }
        
        await markSessionCompleted(client, sessionId);
        return Response.json({ success: true });
      }
    }
    
    // Handle FormData requests (for file uploads and session creation)
    const formData = await request.formData();
    intent = formData.get('intent') as string;
    
    switch (intent) {
      case 'createSession': {
        const situation = formData.get('situation') as string || 'Other';
        const session = await createLetGoBuddySession(client, { userId: user.id, situation });
        return Response.json(session);
      }
      
      case 'uploadImage': {
        const { uploadLetGoBuddyImages } = await import("../mutations");
        const imageFiles: File[] = [];
        
        for (const [key, value] of formData.entries()) {
          if (key.startsWith('image') && value instanceof File) {
            imageFiles.push(value);
          }
        }
        
        if (imageFiles.length === 0) {
          return Response.json({ error: "No image files provided" }, { status: 400 });
        }
        
        const imageUrls = await uploadLetGoBuddyImages(client, { 
          userId: user.id, 
          images: imageFiles 
        });
        
        return Response.json({ imageUrls });
      }
      
      default:
        return Response.json({ error: 'Invalid intent' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Let Go Buddy action error:', error);
    return Response.json({ 
      error: error.message || 'Operation failed' 
    }, { status: 500 });
  }
}

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface ItemDetails {
  usagePeriod: string;
  pros: string;
  cons: string;
}

interface AppState {
  step: number;
  sessionId: number | null;
  error: string | null;
  isLoading: boolean;
  itemName: string;
  itemCategory: string;
  situation: string;
  uploadedFiles: File[];
  previewUrls: string[];
  uploadedImageUrls: string[];
  chatConversation: ChatMessage[];
  isChatComplete: boolean;
  analysisResult: any;
  itemDetails: ItemDetails;
}

export default function LetGoBuddyPage({ loaderData }: { loaderData: { user: any; canUseLetGoBuddy: boolean; usageCount: number } }) {
  const { canUseLetGoBuddy, usageCount } = loaderData;
  const navigate = useNavigate();
  const sessionFetcher = useFetcher();
  const imageFetcher = useFetcher();
  const analysisFetcher = useFetcher();
  const sessionCompleteFetcher = useFetcher();

  const [state, setState] = useState<AppState>({
    step: 1,
    sessionId: null,
    error: null,
    isLoading: false,
    itemName: "",
    itemCategory: "",
    situation: "",
    uploadedFiles: [],
    previewUrls: [],
    uploadedImageUrls: [],
    chatConversation: [],
    isChatComplete: false,
    analysisResult: null,
    itemDetails: {
      usagePeriod: "",
      pros: "",
      cons: ""
    }
  });

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle session creation
  useEffect(() => {
    if (sessionFetcher.data && sessionFetcher.state === 'idle') {
      const result = sessionFetcher.data as any;
      if (result.error) {
        updateState({ error: result.error, isLoading: false });
      } else if (result.session_id) {
        updateState({ sessionId: result.session_id, error: null, step: 2 });
      }
    }
  }, [sessionFetcher.data, sessionFetcher.state, updateState]);

  // Handle image upload
  useEffect(() => {
    if (imageFetcher.data && imageFetcher.state === 'idle') {
      const result = imageFetcher.data as any;
      if (result.error) {
        updateState({ error: result.error, isLoading: false });
      } else if (result.imageUrls) {
        updateState({ uploadedImageUrls: result.imageUrls, isLoading: false });
      }
    }
  }, [imageFetcher.data, imageFetcher.state, updateState]);

  // Handle analysis
  useEffect(() => {
    if (analysisFetcher.data && analysisFetcher.state === 'idle') {
      const result = analysisFetcher.data as any;
      if (result.error) {
        updateState({ error: result.error, isLoading: false });
      } else {
        updateState({ analysisResult: result, step: 5, isLoading: false });
        // Mark session as complete
        if (state.sessionId) {
          sessionCompleteFetcher.submit(
            { intent: 'markSessionComplete', sessionId: state.sessionId },
            { method: 'post', encType: 'application/json' }
          );
        }
      }
    }
  }, [analysisFetcher.data, analysisFetcher.state, state.sessionId, updateState, sessionCompleteFetcher]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validation
    if (files.length > 5) {
      updateState({ error: "You can upload maximum 5 files" });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      updateState({ error: "Only JPEG, PNG, WebP, HEIC, and HEIF images are allowed" });
      return;
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      updateState({ error: "File(s) too large. Maximum file size is 10MB" });
      return;
    }

    if (files.length > 0) {
      const urls = files.map(file => URL.createObjectURL(file));
      updateState({ 
        uploadedFiles: files, 
        previewUrls: urls, 
        error: null, 
        isLoading: true,
        step: 2
      });
      
      // Create session and upload images
      sessionFetcher.submit({ intent: 'createSession', situation: state.situation || 'Other' }, { method: "post", encType: "application/json" });
      
      const formData = new FormData();
      formData.append('intent', 'uploadImage');
      files.forEach((file, index) => {
        formData.append(`image${index === 0 ? '' : index}`, file);
      });
      imageFetcher.submit(formData, { method: "post", encType: "multipart/form-data" });
    }
  }, [state.situation, updateState, sessionFetcher, imageFetcher]);

  const handleChatComplete = useCallback((conversationData: ChatMessage[]) => {
    updateState({ 
      chatConversation: conversationData, 
      isChatComplete: true, 
      step: 4 
    });
  }, [updateState]);

  const handleGenerateAnalysis = useCallback(() => {
    if (!state.sessionId || !state.uploadedImageUrls.length || !state.situation || !state.isChatComplete) {
      updateState({ error: "Please complete all steps before analysis" });
      return;
    }

    updateState({ isLoading: true, error: null });

    const analysisParams = new URLSearchParams({
      sessionId: state.sessionId.toString(),
      imageUrls: JSON.stringify(state.uploadedImageUrls),
      situation: state.situation,
      itemName: state.itemName || "",
      itemCategory: state.itemCategory || "",
      chatConversation: JSON.stringify(state.chatConversation),
      itemDetails: JSON.stringify(state.itemDetails),
      userLocation: "Bangkok"
    });

    analysisFetcher.load(`/let-go-buddy/analysis?${analysisParams.toString()}`);
  }, [state, updateState, analysisFetcher]);
  

  const handleRemoveImage = useCallback((index: number) => {
    const newFiles = state.uploadedFiles.filter((_, i) => i !== index);
    const newPreviews = state.previewUrls.filter((_, i) => i !== index);
    updateState({ uploadedFiles: newFiles, previewUrls: newPreviews });
  }, [state.uploadedFiles, state.previewUrls, updateState]);

  const handleStartSelling = useCallback(() => {
    if (!state.analysisResult) return;
    
    const { analysisResult, uploadedImageUrls } = state;
    const listingData = {
      title: analysisResult.listing_data?.title || analysisResult.ai_listing_title || analysisResult.item_analysis?.item_name || "Item for Sale",
      description: analysisResult.listing_data?.description || analysisResult.ai_listing_description || "Great condition item",
      price: "0",
      currency: analysisResult.listing_data?.currency || "THB",
      priceType: analysisResult.listing_data?.price_type || "Fixed",
      condition: analysisResult.listing_data?.condition || analysisResult.item_analysis?.item_condition || "Good",
      category: analysisResult.listing_data?.category || analysisResult.item_analysis?.item_category || "Other",
      location: analysisResult.listing_data?.location || analysisResult.ai_listing_location || "Bangkok",
      images: uploadedImageUrls,
      fromLetGoBuddy: true
    };

    navigate("/secondhand/submit-a-listing", {
      state: {
        prefillData: listingData,
        fromLetGoBuddy: true
      }
    });
  }, [state.analysisResult, state.uploadedImageUrls, navigate]);

  const handleFreeGiveaway = useCallback(() => {
    if (!state.analysisResult?.item_analysis) return;
    
    const { analysisResult, uploadedImageUrls } = state;
    const giveawayData = {
      title: `FREE: ${analysisResult.item_analysis.item_name} - Giving away for free!`,
      description: `Free giveaway! This ${analysisResult.item_analysis.item_name} is in good condition and I'm giving it away for free. Perfect for someone who needs it.`,
      price: "0",
      currency: "THB",
      priceType: "Free",
      condition: analysisResult.listing_data?.condition || "Good",
      category: analysisResult.listing_data?.category || "Other",
      location: analysisResult.listing_data?.location || "Bangkok",
      images: uploadedImageUrls,
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
  }, [state.analysisResult, state.uploadedImageUrls, navigate]);

  const addToChallenge = useCallback(() => {
    if (!state.analysisResult?.item_analysis) {
      updateState({ error: "Please complete analysis first before adding to challenge" });
      return;
    }

    const { analysisResult, itemName, uploadedImageUrls, sessionId } = state;
    sessionStorage.setItem('letGoBuddyAnalysis', JSON.stringify({
      analysisResult,
      itemName,
      uploadedImageUrls,
      sessionId
    }));

    navigate('/let-go-buddy/challenge-calendar', {
      state: {
        pendingItem: {
          name: analysisResult.item_analysis.item_name || itemName || 'Declutter Item',
          scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        }
      }
    });
  }, [state, updateState, navigate]);

  const addToKeepBox = useCallback(() => {
    updateState({ error: null });
    alert("Added to your 'Keep Box'.");
  }, [updateState]);


  return (
    <div className="w-full md:w-3/5 mx-auto px-4 py-8 space-y-8">

      <div className="text-center"><h1 className="text-4xl font-bold">Let Go Buddy</h1><p className="text-lg text-muted-foreground mt-2">Your AI companion for decluttering with heart.</p></div>

      {/* Usage Limit Message - Show at the top */}
      {!canUseLetGoBuddy && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <div className="text-amber-800 font-medium mb-2">Free Usage Limit Reached</div>
          <div className="text-sm text-amber-700">
            You've used your free Let Go Buddy sessions ({usageCount}/2) as an Explorer level user. 
            Build trust in the community to unlock more free sessions!
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CameraIcon className="w-6 h-6" />Step 1: Upload Your Item</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleFileUpload} 
            className="hidden" 
            id="file-upload" 
            disabled={state.isLoading || !canUseLetGoBuddy} 
          />
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()} 
            variant="outline" 
            className={`w-full ${!canUseLetGoBuddy ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : ''}`}
            disabled={state.isLoading || !canUseLetGoBuddy}
          >
            {state.isLoading ? (
              <><ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : !canUseLetGoBuddy ? (
              <><CameraIcon className="w-4 h-4 mr-2 text-gray-400" />Upload Photo (Limit Reached)</>
            ) : (
              "Upload Photos (up to 5)"
            )}
          </Button>
          {state.error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{state.error}</div>}
          
          {/* Preview images */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {state.previewUrls.length > 0 ? (
              state.previewUrls.map((url, idx) => (
                <div key={`preview-${state.uploadedFiles[idx]?.name}-${state.uploadedFiles[idx]?.size}-${idx}`} className="relative group">
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(idx)}
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
          {state.previewUrls.length > 0 && (
            <span className="text-xs text-neutral-500 mt-2">{state.uploadedFiles.length}/5 images</span>
          )}
          
          {/* Item Details */}
          {state.previewUrls.length > 0 && state.step >= 2 && (
            <div className="mt-4 space-y-4">
              <Input placeholder="Item Name (e.g., Old College Hoodie)" value={state.itemName} onChange={(e) => updateState({ itemName: e.target.value })} className="w-full" />
              <Select onValueChange={(value) => updateState({ itemCategory: value })} value={state.itemCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.enumValues.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "Home" ? "Home & Furniture" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Additional Item Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">How long have you used this item?</label>
                  <Select value={state.itemDetails.usagePeriod} onValueChange={(value) => updateState({ itemDetails: { ...state.itemDetails, usagePeriod: value } })}>
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
                  <label className="text-sm font-medium text-gray-700">What do you like about this item? (pros)</label>
                  <Textarea 
                    value={state.itemDetails.pros}
                    onChange={(e) => updateState({ itemDetails: { ...state.itemDetails, pros: e.target.value } })}
                    placeholder="e.g., Still works perfectly, great quality, sentimental value..."
                    className="resize-none"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">What concerns you about this item? (cons)</label>
                  <Textarea 
                    value={state.itemDetails.cons}
                    onChange={(e) => updateState({ itemDetails: { ...state.itemDetails, cons: e.target.value } })}
                    placeholder="e.g., Takes up space, rarely used, minor scratches..."
                    className="resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Step 2: Situation Selection */}
      {state.step >= 2 && !state.error && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><SparklesIcon className="w-6 h-6" />Step 2: Select Your Situation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">What's your current decluttering situation?</p>
            <div className="flex flex-wrap gap-3">
              {DECLUTTER_SITUATIONS.map((s) => (
                <Button
                  key={s.value}
                  variant={state.situation === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateState({ situation: s.value, step: 3 })}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Joy Conversation */}
      {state.step >= 3 && !state.error && !state.isChatComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="w-6 h-6" />
              Step 3: Talk with Joy
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Have a natural conversation with your AI coach Joy to explore your feelings about this item
            </p>
          </CardHeader>
          <CardContent>
            <AICoachChat
              itemName={state.itemName}
              situation={state.situation}
              onComplete={handleChatComplete}
            />
          </CardContent>
        </Card>
      )}

      {/* Show completed conversation summary */}
      {state.step >= 3 && state.isChatComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="w-6 h-6" />
              ✅ Conversation Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                Great conversation! Your AI coach Joy has gathered insights about your relationship with this item. 
                Ready to get your personalized recommendation?
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Generate Analysis */}
      {state.step >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="w-6 h-6" />
              Step 4: Generate AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!state.analysisResult ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Ready to get AI-powered recommendations for your item?</p>
                {!state.isChatComplete && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <div className="text-amber-800 text-sm">
                      Please complete the conversation with Joy to proceed
                    </div>
                  </div>
                )}
                <Button 
                  onClick={handleGenerateAnalysis} 
                  className="w-full"
                  disabled={state.isLoading || !state.situation || !state.uploadedImageUrls.length || !state.isChatComplete}
                  size="lg"
                >
                  {state.isLoading ? (
                    <><ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><SparklesIcon className="w-5 h-5 mr-2" />Generate AI Analysis</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">AI Recommendation: {state.analysisResult.recommendation?.action}</h4>
                  <p className="text-sm text-blue-700">{state.analysisResult.recommendation?.reason}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Item Analysis</div>
                    <div className="font-medium">{state.analysisResult.item_analysis?.item_name}</div>
                    <div className="text-sm text-gray-600">Condition: {state.analysisResult.item_analysis?.item_condition}</div>
                  </div>
                </div>

                {/* Conversation Insights Preview */}
                {(state.analysisResult.emotional_attachment_keywords || state.analysisResult.decision_barriers) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-sm font-medium text-blue-800 mb-2">💭 Your Decision Insights</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {state.analysisResult.emotional_attachment_keywords?.length > 0 && (
                        <div>
                          <span className="text-blue-700 font-medium">Emotional:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {state.analysisResult.emotional_attachment_keywords.slice(0, 3).map((keyword: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {state.analysisResult.decision_barriers?.length > 0 && (
                        <div>
                          <span className="text-blue-700 font-medium">Challenges:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {state.analysisResult.decision_barriers.slice(0, 3).map((barrier: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {barrier}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      💡 These insights will be saved to your personal decluttering journal
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Step 5: Action Buttons */}
      {state.step >= 5 && state.analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>What would you like to do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.analysisResult.recommendation?.action === 'Sell' && (
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Ready-to-use Listing Data</h4>
                <p className="text-sm text-green-700 mb-2"><strong>Title:</strong> {state.analysisResult.listing_data?.title || state.analysisResult.ai_listing_title || state.analysisResult.item_analysis?.item_name || "Item for Sale"}</p>
                <p className="text-sm text-green-700"><strong>Description:</strong> {state.analysisResult.listing_data?.description || state.analysisResult.ai_listing_description || "Great condition item"}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={handleStartSelling}
                variant="outline"
                className="w-full"
              >
                Start Selling
              </Button>
              <Button 
                onClick={handleFreeGiveaway}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <GiftIcon className="w-4 h-4" />
                Free Giveaway
              </Button>
              <Button 
                onClick={addToKeepBox}
                variant="outline"
                className="w-full"
              >
                Keep with Love
              </Button>
              <Button 
                onClick={addToChallenge}
                variant="outline"
                className="w-full"
              >
                Add to Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}