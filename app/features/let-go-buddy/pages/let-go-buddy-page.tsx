import { useState, useEffect } from "react";
import { useFetcher, useNavigate, redirect } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Progress } from "~/common/components/ui/progress";
import { CameraIcon, ArrowPathIcon, SparklesIcon, HeartIcon, GiftIcon } from "@heroicons/react/24/outline";
import { AlertTriangle } from "lucide-react";
import { createLetGoBuddySession } from "../mutations";
import { makeSSRClient } from "~/supa-client";
import { EMOTIONAL_QUESTIONS, DECLUTTER_SITUATIONS } from '../constants';

export async function loader({ request }: { request: Request }) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    const url = new URL(request.url);
    return redirect(`/auth/login?redirectTo=${url.pathname}`);
  }
  
  // Check usage limits
  let canUseLetGoBuddy = true;
  const { count } = await client
    .from('let_go_buddy_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (typeof count === 'number' && count >= 2) {
    canUseLetGoBuddy = false;
  }
  
  return { user, canUseLetGoBuddy };
}


export async function action({ request }: { request: Request }) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
      return new Response(JSON.stringify({ error: "You must be logged in to use this feature." }), { status: 401 });
  }
  
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Handle form data requests (image uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const intent = formData.get('intent') as string;
      
      if (intent === 'uploadImage') {
          const { uploadLetGoBuddyImages } = await import("../mutations");
          
          // Handle multiple images
          const imageFiles: File[] = [];
          for (let i = 0; i < 5; i++) {
            const imageFile = formData.get(`image${i === 0 ? '' : i}`) as File;
            if (imageFile && imageFile instanceof File) {
              imageFiles.push(imageFile);
            }
          }
          
          // Also check for single image
          const singleImage = formData.get('image') as File;
          if (singleImage && singleImage instanceof File && imageFiles.length === 0) {
            imageFiles.push(singleImage);
          }
          
          if (imageFiles.length === 0) {
              return new Response(JSON.stringify({ error: "No image files provided" }), { status: 400 });
          }
          
          const imageUrls = await uploadLetGoBuddyImages(client, { 
              userId: user.id, 
              images: imageFiles 
          });
          
          return new Response(JSON.stringify({ imageUrls }), { 
              headers: { 'Content-Type': 'application/json' } 
          });
      }
    }
    
    // Handle JSON requests
    const payload = await request.json();
    const { intent } = payload;
    
    if (intent === 'createSession') {
        const session = await createLetGoBuddySession(client, { userId: user.id, situation: payload.situation || "Other" });
        return new Response(JSON.stringify(session), { headers: { 'Content-Type': 'application/json' } });
    }


    return new Response(JSON.stringify({ error: 'Invalid intent' }), { status: 400 });

  } catch (error: any) {
    console.error('Error in action:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'AI analysis failed' }), { status: 500 });
  }
}

export default function LetGoBuddyPage({ loaderData }: { loaderData: { user: any; canUseLetGoBuddy: boolean } }) {
  const { canUseLetGoBuddy } = loaderData;
  const navigate = useNavigate();
  const sessionFetcher = useFetcher();
  const imageFetcher = useFetcher();
  const analysisFetcher = useFetcher();

  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [situation, setSituation] = useState("");
  const [conversationStep, setConversationStep] = useState(0);
  const [emotionalAnswers, setEmotionalAnswers] = useState<string[]>([]);
  const [itemDetails, setItemDetails] = useState({
    usagePeriod: "",
    pros: "",
    cons: ""
  });
  
  const isCreatingSession = sessionFetcher.state === 'submitting';
  const isAnalyzing = analysisFetcher.state === 'loading';

  useEffect(() => {
    if (sessionFetcher.data && sessionFetcher.state === 'idle') {
        const result = sessionFetcher.data as any;
        if (result.error) {
            setSessionError(result.error);
        } else if (result.session_id) {
            setSessionId(result.session_id);
            setSessionError(null);
            setStep(2);
        }
    }
  }, [sessionFetcher.data, sessionFetcher.state]);

  

  useEffect(() => {
    if (imageFetcher.data && imageFetcher.state === 'idle') {
      const result = imageFetcher.data as any;
      if (result.imageUrls) {
        setUploadedImageUrls(result.imageUrls);
      } else if (result.imageUrl) {
        setUploadedImageUrls(prev => [...prev, result.imageUrl]);
      }
    }
  }, [imageFetcher.data, imageFetcher.state]);

  useEffect(() => {
    if (analysisFetcher.data && analysisFetcher.state === 'idle') {
      const result = analysisFetcher.data as any;
      if (result.error) {
        setSessionError(result.error);
      } else {
        setAnalysisResult(result);
        setStep(5);
      }
    }
  }, [analysisFetcher.data, analysisFetcher.state]);

  // Use EMOTIONAL_QUESTIONS from constants
  const conversationQuestions = EMOTIONAL_QUESTIONS;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 5) {
      alert("You can upload maximum 5 files");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
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

    if (files.length > 0) {
      setUploadedFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      setSessionError(null);
      
      // Create session
      sessionFetcher.submit({ intent: 'createSession', situation: situation || 'Other' }, { method: "post", encType: "application/json" });
      
      // Upload all images at once
      const formData = new FormData();
      formData.append('intent', 'uploadImage');
      files.forEach((file, index) => {
        formData.append(`image${index === 0 ? '' : index}`, file);
      });
      imageFetcher.submit(formData, { method: "post" });
      
      setStep(2);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...emotionalAnswers];
    newAnswers[conversationStep] = answer;
    setEmotionalAnswers(newAnswers);
    if (conversationStep < conversationQuestions.length - 1) {
      setConversationStep(conversationStep + 1);
    } else {
      setStep(4);
    }
  };

  const handleGenerateAnalysis = () => {
    if (!sessionId || !uploadedImageUrls.length || !situation) {
      alert("Please complete all steps before analysis");
      return;
    }

    // Call analysis page loader function to get AI analysis
    const analysisParams = new URLSearchParams({
      sessionId: sessionId.toString(),
      imageUrls: JSON.stringify(uploadedImageUrls),
      situation,
      itemName: itemName || "",
      itemCategory: itemCategory || "",
      emotionalAnswers: JSON.stringify({
        question1: emotionalAnswers[0] || "",
        question2: emotionalAnswers[1] || "",
        question3: emotionalAnswers[2] || ""
      }),
      itemDetails: JSON.stringify(itemDetails),
      userLocation: "Bangkok"
    });

    // Fetch analysis from analysis page loader
    analysisFetcher.load(`/let-go-buddy/analysis?${analysisParams.toString()}`);
  };
  

  const handleRemoveImage = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleStartSelling = () => {
    if (!analysisResult || !analysisResult.listing_data) return;
    
    const listingData = {
      title: analysisResult.listing_data.title,
      description: analysisResult.listing_data.description,
      price: analysisResult.listing_data.price,
      currency: analysisResult.listing_data.currency,
      priceType: analysisResult.listing_data.price_type,
      condition: analysisResult.listing_data.condition,
      category: analysisResult.listing_data.category,
      location: analysisResult.listing_data.location,
      images: uploadedImageUrls,
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
    if (!analysisResult || !analysisResult.item_analysis) return;
    
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
  };

  const addToChallenge = () => navigate('/let-go-buddy/challenge-calendar');
  const addToKeepBox = () => alert("Added to your 'Keep Box'.");


  return (
    <div className="w-full md:w-3/5 mx-auto px-4 py-8 space-y-8">

      <div className="text-center"><h1 className="text-4xl font-bold">Let Go Buddy</h1><p className="text-lg text-muted-foreground mt-2">Your AI companion for decluttering with heart.</p></div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CameraIcon className="w-6 h-6" />Step 1: Upload Your Item</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {!canUseLetGoBuddy && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <div className="text-amber-800 font-medium mb-2">Free Usage Limit Reached</div>
              <div className="text-sm text-amber-700">
                You've used your free Let Go Buddy sessions (2/2) as an Explorer level user. 
                Build trust in the community to unlock more free sessions!
              </div>
            </div>
          )}
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
            id="file-upload" 
            disabled={isCreatingSession || !canUseLetGoBuddy} 
          />
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()} 
            variant="outline" 
            className={`w-full ${!canUseLetGoBuddy ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : ''}`}
            disabled={isCreatingSession || !canUseLetGoBuddy}
          >
            {isCreatingSession ? (
              <><ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
            ) : !canUseLetGoBuddy ? (
              <><CameraIcon className="w-4 h-4 mr-2 text-gray-400" />Upload Photo (Limit Reached)</>
            ) : (
              "Upload Photo"
            )}
          </Button>
          {sessionError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{sessionError}</div>}
          
          {/* Preview images */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {previewUrls.length > 0 ? (
              previewUrls.map((url, idx) => (
                <div key={`preview-${uploadedFiles[idx]?.name}-${uploadedFiles[idx]?.size}-${idx}`} className="relative group">
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
          {previewUrls.length > 0 && (
            <span className="text-xs text-neutral-500 mt-2">{uploadedFiles.length}/5 images</span>
          )}
          
          {/* Item Details */}
          {previewUrls.length > 0 && step >= 2 && (
            <div className="mt-4 space-y-4">
              <Input placeholder="Item Name (e.g., Old College Hoodie)" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full" />
              <Select onValueChange={setItemCategory} value={itemCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Home">Home & Furniture</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Toys">Toys</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Additional Item Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">How long have you used this item?</label>
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
                  <label className="text-sm font-medium text-gray-700">What do you like about this item? (pros)</label>
                  <Textarea 
                    value={itemDetails.pros}
                    onChange={(e) => setItemDetails(prev => ({ ...prev, pros: e.target.value }))}
                    placeholder="e.g., Still works perfectly, great quality, sentimental value..."
                    className="resize-none"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">What concerns you about this item? (cons)</label>
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
          )}
        </CardContent>
      </Card>
      
      {/* Step 2: Situation Selection */}
      {step >= 2 && !sessionError && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><SparklesIcon className="w-6 h-6" />Step 2: Select Your Situation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">What's your current decluttering situation?</p>
            <div className="flex flex-wrap gap-3">
              {DECLUTTER_SITUATIONS.map((s) => (
                <Button
                  key={s.value}
                  variant={situation === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSituation(s.value);
                    setStep(3);
                  }}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Emotion-Based Conversation */}
      {step >= 3 && !sessionError && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><HeartIcon className="w-6 h-6" />Step 3: Emotion-Based Conversation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><p className="text-sm text-muted-foreground text-center">Question {conversationStep + 1} of {conversationQuestions.length}</p><Progress value={((conversationStep + 1) / conversationQuestions.length) * 100} /></div>
            <p className="font-semibold pt-4 text-center">{conversationQuestions[conversationStep]}</p>
            <div className="flex flex-col gap-2"><Button variant="outline" onClick={() => handleAnswer("It brings me joy.")}>It brings me joy</Button><Button variant="outline" onClick={() => handleAnswer("I feel guilty for not using it.")}>I feel guilty for not using it</Button><Button variant="outline" onClick={() => handleAnswer("I'm not sure.")}>I'm not sure</Button></div>
            <Textarea placeholder="Or share your thoughts here..." onBlur={(e) => handleAnswer(e.target.value)} />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Generate Analysis */}
      {step >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="w-6 h-6" />
              Step 4: Generate AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!analysisResult ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Ready to get AI-powered recommendations for your item?</p>
                <Button 
                  onClick={handleGenerateAnalysis} 
                  className={`w-full ${!canUseLetGoBuddy ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : ''}`}
                  disabled={isAnalyzing || !canUseLetGoBuddy || !situation || !uploadedImageUrls.length}
                  size="lg"
                >
                  {isAnalyzing ? (
                    <><ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><SparklesIcon className="w-5 h-5 mr-2" />{!canUseLetGoBuddy ? 'Generate Analysis (Limit Reached)' : 'Generate AI Analysis'}</>
                  )}
                </Button>
                {!canUseLetGoBuddy && (
                  <div className="text-sm text-center bg-emerald-50 text-emerald-700 rounded-md px-4 py-2 border border-emerald-100">
                    😊 You've used all your free Let Go Buddy sessions (2/2). Build trust in the community to unlock more!
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">AI Recommendation: {analysisResult.recommendation?.action}</h4>
                  <p className="text-sm text-blue-700">{analysisResult.recommendation?.reason}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Item Analysis</div>
                    <div className="font-medium">{analysisResult.item_analysis?.item_name}</div>
                    <div className="text-sm text-gray-600">Condition: {analysisResult.item_analysis?.item_condition}</div>
                    <div className="text-sm text-gray-600">Value: THB {analysisResult.item_analysis?.current_value}</div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 mb-1">Environmental Impact</div>
                    <div className="font-medium text-green-700">{analysisResult.environmental_impact?.co2_impact} kg CO2 saved</div>
                    <div className="text-sm text-green-600">Impact Level: {analysisResult.environmental_impact?.impact_level}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Step 5: Action Buttons */}
      {step >= 5 && analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>What would you like to do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.recommendation?.action === 'Sell' && (
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Ready-to-use Listing Data</h4>
                <p className="text-sm text-green-700 mb-2"><strong>Title:</strong> {analysisResult.listing_data?.title}</p>
                <p className="text-sm text-green-700 mb-2"><strong>Suggested Price:</strong> THB {analysisResult.listing_data?.price}</p>
                <p className="text-sm text-green-700"><strong>Description:</strong> {analysisResult.listing_data?.description}</p>
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