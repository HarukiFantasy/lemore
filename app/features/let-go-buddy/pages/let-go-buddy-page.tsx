import { useState, useEffect } from "react";
import { useFetcher, useNavigate, redirect } from "react-router";
import OpenAI from "openai";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Progress } from "~/common/components/ui/progress";
import { CameraIcon, ArrowPathIcon, SparklesIcon, HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AlertTriangle } from "lucide-react";
import { analyzeImageForSelling } from "../image-analysis.server";
import { createLetGoBuddySession } from "../mutations";
import { makeSSRClient } from "~/supa-client";

export async function loader({ request }: { request: Request }) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    const url = new URL(request.url);
    return redirect(`/auth/login?redirectTo=${url.pathname}`);
  }
  return null; // User is logged in
}

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export async function action({ request }: { request: Request }) {
  const payload = await request.json();
  const { intent } = payload;
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
      return new Response(JSON.stringify({ error: "You must be logged in to use this feature." }), { status: 401 });
  }
  
  try {
    if (intent === 'createSession') {
        const session = await createLetGoBuddySession(client, { userId: user.id, situation: "Other" });
        return new Response(JSON.stringify(session), { headers: { 'Content-Type': 'application/json' } });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (intent === 'emotionalAnalysis') {
      const { itemName, itemCategory, answers } = payload;
      const prompt = `
        The user is considering letting go of an item: ${itemName} (${itemCategory || 'Uncategorized'}).
        Their answers to emotional questions are:
        1. Why are you holding onto this item? "${answers['question1']}"
        2. What kind of feelings does this item give you? "${answers['question2']}"
        3. Is there a reason you are hesitant to let it go? "${answers['question3']}"
        Based on these, provide a JSON object with "recommendation", "explanation", and "emotionalTags" (comma-separated string).
      `;
      const completion = await openai.chat.completions.create({ model: 'gpt-4o', messages: [{ role: 'system', content: prompt }], response_format: { type: "json_object" }});
      const content = completion.choices[0].message.content;
      if (!content) throw new Error("Empty emotional analysis response");
      return new Response(content, { headers: { 'Content-Type': 'application/json' } });
    }

    if (intent === 'sellingAnalysis') {
        const { imageBase64, itemName } = payload;
        const analysis = await analyzeImageForSelling(imageBase64, itemName);
        return new Response(JSON.stringify(analysis), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid intent' }), { status: 400 });

  } catch (error: any) {
    console.error('Error in action:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'AI analysis failed' }), { status: 500 });
  }
}

export default function LetGoBuddyPage() {
  const navigate = useNavigate();
  const sessionFetcher = useFetcher();
  const emotionalFetcher = useFetcher();
  const sellingFetcher = useFetcher();

  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showSellingPopup, setShowSellingPopup] = useState(false);
  const [aiListing, setAiListing] = useState<any>(null);

  const [conversationStep, setConversationStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  
  const isCreatingSession = sessionFetcher.state === 'submitting';
  const isEmotionalAnalyzing = emotionalFetcher.state === 'submitting';
  const isSellingAnalyzing = sellingFetcher.state === 'submitting';

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
    if (emotionalFetcher.data && emotionalFetcher.state === 'idle') {
      const result = emotionalFetcher.data as any;
      if (result && typeof result.emotionalTags === 'string') {
        result.emotionalTags = result.emotionalTags.split(',').map((tag: string) => tag.trim());
      }
      setAnalysisResult(result);
    }
  }, [emotionalFetcher.data, emotionalFetcher.state]);
  
  useEffect(() => {
      if (sellingFetcher.data && sellingFetcher.state === 'idle') {
          const result = sellingFetcher.data as any;
          setAiListing({ ...result, price: `THB ${result.price}` });
          setShowSellingPopup(true);
      }
  }, [sellingFetcher.data, sellingFetcher.state]);

  const conversationQuestions = [ "What kind of feelings does this item give you?", "When was the last time you remember using it?", "Is there a reason you are hesitant to let it go?" ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSessionError(null);
      sessionFetcher.submit({ intent: 'createSession' }, { method: "post", encType: "application/json" });
    }
  };

  const handleAnswer = (answer: string) => {
    setAnswers([...answers, answer]);
    if (conversationStep < conversationQuestions.length - 1) setConversationStep(conversationStep + 1);
    else setStep(3);
  };

  const handleGenerateAnalysis = () => {
    emotionalFetcher.submit({ intent: 'emotionalAnalysis', sessionId, itemName, itemCategory, answers: { question1: answers[0] || "", question2: answers[1] || "", question3: answers[2] || "" } }, { method: "post", encType: "application/json" });
  };
  
  const handleStartSelling = async () => {
    if (!uploadedFile) return;
    const imageBase64 = await toBase64(uploadedFile);
    sellingFetcher.submit({ intent: 'sellingAnalysis', imageBase64, itemName, sessionId }, { method: "post", encType: "application/json" });
  };

  const addToChallenge = () => navigate('/let-go-buddy/challenge-calendar');
  const addToKeepBox = () => alert("Added to your 'Keep Box'.");

  const handlePostToSecondhand = () => {
    if (aiListing) {
      const listingData = { title: aiListing.title, description: aiListing.description, price: aiListing.price.replace('THB ', ''), currency: "THB", priceType: "Fixed", location: "Bangkok", images: uploadedFile ? [uploadedFile] : [], category: itemCategory || "Other", condition: "Used - Good", aiGenerated: true, fromLetGoBuddy: true };
      navigate('/secondhand/submit-a-listing', { state: { prefillData: listingData, fromLetGoBuddy: true } });
      setShowSellingPopup(false);
    }
  };

  return (
    <div className="w-full md:w-3/5 mx-auto px-4 py-8 space-y-8">
      {isSellingAnalyzing && ( <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"><div className="text-center"><ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-gray-600" /><p className="mt-4 text-lg font-semibold text-gray-700">AI is generating your listing...</p></div></div> )}

      <div className="text-center"><h1 className="text-4xl font-bold">Let Go Buddy</h1><p className="text-lg text-muted-foreground mt-2">Your AI companion for decluttering with heart.</p></div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CameraIcon className="w-6 h-6" />Step 1: Upload Your Item</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" disabled={isCreatingSession} />
          <Button onClick={() => document.getElementById('file-upload')?.click()} variant="outline" className="w-full" disabled={isCreatingSession}>
            {isCreatingSession ? <><ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" /> Checking...</> : "Upload Photo"}
          </Button>
          {sessionError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{sessionError}</div>}
          {previewUrl && step < 2 && !sessionError && <div className="text-center text-sm text-muted-foreground">Successfully uploaded. Proceeding to the next step...</div>}
          {previewUrl && step >= 2 && (
            <div className="flex flex-col items-center">
              <img src={previewUrl} alt="Item preview" className="w-48 h-48 object-cover rounded-md" />
              <Input placeholder="Item Name (e.g., Old College Hoodie)" value={itemName} onChange={(e) => setItemName(e.target.value)} className="mt-4 w-full" />
              <Select onValueChange={setItemCategory} value={itemCategory}><SelectTrigger className="w-full mt-2"><SelectValue placeholder="Select a category (optional)" /></SelectTrigger>
                <SelectContent><SelectItem value="clothing">Clothing</SelectItem><SelectItem value="books">Books</SelectItem><SelectItem value="electronics">Electronics</SelectItem><SelectItem value="furniture">Furniture</SelectItem><SelectItem value="kitchenware">Kitchenware</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
      
      {step >= 2 && !sessionError && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><HeartIcon className="w-6 h-6" />Step 2: Emotion-Based Conversation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><p className="text-sm text-muted-foreground text-center">Question {conversationStep + 1} of {conversationQuestions.length}</p><Progress value={((conversationStep + 1) / conversationQuestions.length) * 100} /></div>
            <p className="font-semibold pt-4 text-center">{conversationQuestions[conversationStep]}</p>
            <div className="flex flex-col gap-2"><Button variant="outline" onClick={() => handleAnswer("It brings me joy.")}>It brings me joy</Button><Button variant="outline" onClick={() => handleAnswer("I feel guilty for not using it.")}>I feel guilty for not using it</Button><Button variant="outline" onClick={() => handleAnswer("I'm not sure.")}>I'm not sure</Button></div>
            <Textarea placeholder="Or share your thoughts here..." onBlur={(e) => handleAnswer(e.target.value)} />
          </CardContent>
        </Card>
      )}

      {step >= 3 && ( <Card><CardHeader><CardTitle className="flex items-center gap-2"><SparklesIcon className="w-6 h-6" />Step 3: AI Insight</CardTitle></CardHeader><CardContent>{isEmotionalAnalyzing ? <div className="flex items-center justify-center gap-2"><ArrowPathIcon className="w-5 h-5 animate-spin" /><span>Analyzing...</span></div> : analysisResult ? <div><p className="font-semibold">{analysisResult.recommendation}</p><p className="text-sm text-muted-foreground mt-2">{analysisResult.explanation}</p><div className="flex gap-2 mt-4 flex-wrap">{analysisResult.emotionalTags.map((tag: string) => ( <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{tag}</span> ))}</div><Button variant="outline" onClick={() => setStep(4)} className="w-full mt-4">Continue</Button></div> : <Button variant="outline" onClick={handleGenerateAnalysis} className="w-full" disabled={isEmotionalAnalyzing}>Get AI Insight</Button>}</CardContent></Card> )}
      
      {step === 4 && analysisResult && ( <Card><CardHeader><CardTitle>What's next?</CardTitle></CardHeader><CardContent className="flex flex-col gap-2"><Button onClick={handleStartSelling} variant="outline" disabled={isSellingAnalyzing}>Start Selling</Button><Button onClick={addToChallenge} variant="outline">Add to Challenge</Button><Button onClick={addToKeepBox} variant="outline">Keep it in my box</Button></CardContent></Card> )}

      {showSellingPopup && aiListing && ( <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-xl"><button className="absolute top-2 right-2 p-1" onClick={() => setShowSellingPopup(false)}><XMarkIcon className="w-5 h-5 text-gray-500" /></button><div className="mb-4 text-lg font-semibold flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-purple-500" />AI Listing</div><div className="space-y-4"><div><h3 className="font-bold">{aiListing.title}</h3><p className="text-sm text-gray-600 mt-1">{aiListing.description}</p></div><div className="font-semibold text-green-600 bg-green-50 p-2 rounded-md text-center">{aiListing.price}</div></div><div className="flex gap-2 mt-4"><Button className="flex-1" onClick={handlePostToSecondhand}>Post</Button><Button className="flex-1" variant="ghost" onClick={handleStartSelling}>Regenerate</Button></div></div></div> )}
    </div>
  );
}
