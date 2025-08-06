import { useState } from "react";
import type { Route } from "./+types/let-go-buddy-analysis-page";
import { Button } from "~/common/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Input } from "~/common/components/ui/input";
import { 
  SparklesIcon, 
  HeartIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  ArrowRightIcon,
  TruckIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { makeSSRClient } from "~/supa-client";
import { redirect } from "react-router";
import { generateAnalysis } from "../llm.server";
import { createItemAnalysis, updateSessionCompletion, addToChallengeCalendar } from "../mutations";
import { format, addDays } from "date-fns";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }

  const sessionId = parseInt(params.session_id);
  if (isNaN(sessionId)) {
    return redirect('/let-go-buddy');
  }

  // Check if analysis already exists for this session
  const { data: existingAnalysis } = await client
    .from('item_analyses')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (existingAnalysis) {
    return {
      sessionId,
      analysis: existingAnalysis,
      isNewAnalysis: false
    };
  }

  return {
    sessionId,
    analysis: null,
    isNewAnalysis: true
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }

  const sessionId = parseInt(params.session_id);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "generate-analysis") {
      // Get conversation data from form (this would normally come from the chat)
      const mockConversation = [
        { type: 'ai', content: "Hi! I'm Joy, your declutter buddy! How are you feeling about this item right now?" },
        { type: 'user', content: "I'm feeling conflicted about this old guitar. I used to play it a lot." },
        { type: 'ai', content: "I can sense that feeling. When was the last time you actually used this item?" },
        { type: 'user', content: "Honestly, it's been over two years since I last played it." },
        { type: 'ai', content: "If this item mysteriously disappeared tomorrow, what would your first reaction be?" },
        { type: 'user', content: "I think I'd be sad at first but probably wouldn't really miss it day to day." },
        { type: 'ai', content: "What's the main thing keeping this item in your life right now?" },
        { type: 'user', content: "Sentimental value and the memories of when I used to play music with friends." },
        { type: 'ai', content: "When you see this item, does it bring you joy or feel like it's just there?" },
        { type: 'user', content: "It mostly just makes me feel a bit guilty for not using it." }
      ];

      // Generate AI analysis
      const aiAnalysis = await generateAnalysis(mockConversation as any);
      
      // Create item analysis record
      await createItemAnalysis(client, {
        session_id: sessionId,
        item_name: aiAnalysis.ai_listing_title || "Guitar",
        item_category: "musical_instruments" as any,
        item_condition: "good" as any,
        recommendation: aiAnalysis.ai_category === "sell" ? "sell" : aiAnalysis.ai_category === "donate" ? "donate" : "keep" as any,
        recommendation_reason: aiAnalysis.analysis_summary,
        emotional_score: 7,
        ai_listing_title: aiAnalysis.ai_listing_title,
        ai_listing_description: aiAnalysis.ai_listing_description,
        emotional_attachment_keywords: ["sentimental", "memories", "guilt"],
        usage_pattern_keywords: ["rarely_used", "neglected"],
        decision_factor_keywords: ["emotional_value", "practical_unused"],
        personality_insights: ["nostalgic", "guilt_driven"],
        decision_barriers: ["sentimental_attachment"]
      });

      return { 
        analysisResult: aiAnalysis,
        success: true 
      };
    }

    if (intent === "start-selling") {
      const analysisId = formData.get("analysis_id") as string;
      const { data: analysis } = await client
        .from('item_analyses')
        .select('*')
        .eq('analysis_id', analysisId)
        .single();

      if (analysis) {
        await updateSessionCompletion(client, sessionId, true);
        const params = new URLSearchParams({
          session_id: sessionId.toString(),
          title: analysis.ai_listing_title || '',
          description: analysis.ai_listing_description || '',
        });
        return redirect(`/secondhand/submit-a-listing?${params}`);
      }
    }

    if (intent === "donate") {
      const analysisId = formData.get("analysis_id") as string;
      const { data: analysis } = await client
        .from('item_analyses')
        .select('*')
        .eq('analysis_id', analysisId)
        .single();

      if (analysis) {
        await updateSessionCompletion(client, sessionId, true);
        const params = new URLSearchParams({
          session_id: sessionId.toString(),
          title: analysis.ai_listing_title || '',
          description: analysis.ai_listing_description || '',
          donate: 'true'
        });
        return redirect(`/secondhand/submit-a-listing?${params}`);
      }
    }

    if (intent === "add-to-challenge") {
      const scheduledDate = formData.get("scheduled_date") as string;
      const itemName = formData.get("item_name") as string;
      
      if (scheduledDate && itemName) {
        await addToChallengeCalendar(client, {
          userId: user.id,
          itemName,
          scheduledDate
        });
        
        await updateSessionCompletion(client, sessionId, true);
        return redirect('/let-go-buddy/challenge-calendar');
      }
    }

  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  return null;
}

export default function LetGoBuddyAnalysisPage({ loaderData, actionData }: Route.ComponentProps) {
  const { sessionId, analysis: existingAnalysis, isNewAnalysis } = loaderData;
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  
  const analysis = actionData?.analysisResult || existingAnalysis;

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true);
    
    // Create form and submit
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';
    
    const intentInput = document.createElement('input');
    intentInput.name = 'intent';
    intentInput.value = 'generate-analysis';
    form.appendChild(intentInput);
    
    document.body.appendChild(form);
    form.submit();
  };

  if (!analysis && isNewAnalysis) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Analyzing Your Conversation</h1>
          <Badge variant="outline" className="ml-auto">Session {sessionId}</Badge>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Ready to Analyze Your Item?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              I'll analyze your conversation with Joy to provide personalized recommendations 
              for your item based on your emotional attachment and usage patterns.
            </p>
            <Button 
              onClick={handleGenerateAnalysis} 
              disabled={isGenerating}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'sell': return 'text-green-600 bg-green-50';
      case 'donate': return 'text-blue-600 bg-blue-50';
      case 'keep': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Analysis Results</h1>
        <Badge variant="outline" className="ml-auto">Session {sessionId}</Badge>
      </div>

      {/* Main Analysis Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">{analysis.ai_listing_title || "Your Item"}</CardTitle>
              <Badge className={getRecommendationColor(analysis.ai_category || analysis.recommendation)}>
                Recommendation: {(analysis.ai_category || analysis.recommendation).charAt(0).toUpperCase() + (analysis.ai_category || analysis.recommendation).slice(1)}
              </Badge>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <HeartIcon className="w-4 h-4" />
                <span>Emotional Score: {analysis.emotional_score || 7}/10</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Joy's Analysis</h4>
              <p className="text-gray-700">
                {analysis.analysis_summary || analysis.recommendation_reason}
              </p>
            </div>
            
            {analysis.emotion_summary && (
              <div>
                <h4 className="font-medium mb-2">Your Emotional Connection</h4>
                <p className="text-gray-700">{analysis.emotion_summary}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Sell Option */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <form method="post">
              <input type="hidden" name="intent" value="start-selling" />
              <input type="hidden" name="analysis_id" value={analysis.analysis_id} />
              
              <CurrencyDollarIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-green-700">Start Selling</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a listing with AI-generated title and description
              </p>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                <ArrowRightIcon className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Donate Option */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <form method="post">
              <input type="hidden" name="intent" value="donate" />
              <input type="hidden" name="analysis_id" value={analysis.analysis_id} />
              
              <HeartIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-blue-700">Donate</h3>
              <p className="text-sm text-gray-600 mb-4">
                List for free to help someone in need
              </p>
              <Button type="submit" variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                <TruckIcon className="w-4 h-4 mr-2" />
                List for Free
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Challenge Calendar */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <CalendarIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-orange-700">Challenge Calendar</h3>
            <p className="text-sm text-gray-600 mb-4">
              Schedule when to revisit this decision
            </p>
            
            <div className="relative">
              <Button 
                variant="outline" 
                className="w-full mb-2"
                onClick={() => {
                  // Simple date picker - for now just set to tomorrow
                  setSelectedDate(addDays(new Date(), 1));
                }}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Pick a date'}
              </Button>
            </div>

            <form method="post">
              <input type="hidden" name="intent" value="add-to-challenge" />
              <input type="hidden" name="item_name" value={analysis.ai_listing_title || analysis.item_name} />
              <input type="hidden" name="scheduled_date" value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} />
              
              <Button 
                type="submit" 
                variant="outline" 
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                disabled={!selectedDate}
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* AI Generated Listing Preview */}
      {analysis.ai_listing_description && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Listing Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={analysis.ai_listing_title} readOnly className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {analysis.ai_listing_description}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}