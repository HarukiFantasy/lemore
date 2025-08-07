import { useState, useRef } from "react";
import type { Route } from "./+types/let-go-buddy-chat-page";
import { Button } from "~/common/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Badge } from "~/common/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { CameraIcon, TrashIcon, SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { makeSSRClient } from "~/supa-client";
import { redirect } from "react-router";
import AICoachChat from "../components/AICoachChat";

const UPLOAD_SITUATIONS = [
  { value: "ready-to-declutter", label: "Ready to declutter" },
  { value: "feeling-overwhelmed", label: "Feeling overwhelmed" },
  { value: "moving-soon", label: "Moving soon" },
  { value: "spring-cleaning", label: "Spring cleaning" },
  { value: "need-space", label: "Need more space" },
  { value: "organizing", label: "Getting organized" }
];

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

  // Verify session belongs to user
  const { data: session, error } = await client
    .from('let_go_buddy_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error || !session) {
    return redirect('/let-go-buddy');
  }

  // Get search parameters
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode') || 'setup';
  const item = url.searchParams.get('item') || '';
  const situation = url.searchParams.get('situation') || '';

  return {
    sessionId,
    mode,
    item,
    situation
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
  const intent = formData.get("intent");

  if (intent === "start-chat") {
    return redirect(`/let-go-buddy/chat/${sessionId}?mode=chat`);
  }

  return null;
}

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

export default function LetGoBuddyChatPage({ loaderData }: Route.ComponentProps) {
  const { sessionId, mode, item: itemFromParams, situation: situationFromParams } = loaderData;
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [situation, setSituation] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartChat = async () => {
    if (!uploadedFile || !itemName || !situation) return;

    setIsUploading(true);
    
    // Here you would upload the file to Supabase storage
    // For now, we'll just proceed to chat mode
    setTimeout(() => {
      window.location.href = `/let-go-buddy/chat/${sessionId}?mode=chat&item=${encodeURIComponent(itemName)}&situation=${encodeURIComponent(situation)}`;
    }, 1000);
  };

  const handleChatComplete = (conversationData: ChatMessage[]) => {
    // Store conversation in sessionStorage to pass to analysis page
    sessionStorage.setItem(`lgb_conversation_${sessionId}`, JSON.stringify(conversationData));
    sessionStorage.setItem(`lgb_item_${sessionId}`, itemFromParams || itemName);
    sessionStorage.setItem(`lgb_situation_${sessionId}`, situationFromParams || situation);
    sessionStorage.setItem(`lgb_additional_${sessionId}`, additionalInfo);
    
    // Navigate to analysis page
    window.location.href = `/let-go-buddy/analysis/${sessionId}`;
  };

  if (mode === 'chat') {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Chat with Joy</h1>
          <Badge variant="outline" className="ml-auto">Session {sessionId}</Badge>
        </div>
        
        <AICoachChat 
          itemName={itemFromParams}
          situation={situationFromParams}
          onComplete={handleChatComplete}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Let Go Buddy Session</h1>
        <Badge variant="outline" className="ml-auto">Session {sessionId}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="w-5 h-5" />
            Upload Your Item Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <label htmlFor="photo-upload">Item Photo *</label>
            <div className="mt-2">
              {!uploadedFile ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CameraIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Upload a photo of your item
                  </p>
                  <p className="text-sm text-gray-500">
                    JPEG, PNG, or WebP • Max 5MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={previewUrl!} 
                      alt="Item preview" 
                      className="w-48 h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label htmlFor="item-name">What is this item? *</label>
            <Input
              id="item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Vintage leather jacket, Coffee maker, etc."
              className="mt-1"
            />
          </div>

          {/* Situation */}
          <div>
            <label>What brings you here today? *</label>
            <Select value={situation} onValueChange={setSituation}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose your current situation" />
              </SelectTrigger>
              <SelectContent>
                {UPLOAD_SITUATIONS.map((situation) => (
                  <SelectItem key={situation.value} value={situation.value}>
                    {situation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Info */}
          <div>
            <label htmlFor="additional-info">Any additional context? (Optional)</label>
            <Textarea
              id="additional-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Tell me more about this item or your situation..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button 
              onClick={handleStartChat}
              disabled={!uploadedFile || !itemName || !situation || isUploading}
              className="w-full bg-[#91a453] text-[#fcffe7] hover:bg-[#D4DE95] hover:text-[#3D4127]"
              size="lg"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2">Start Chat with Joy</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Joy will ask you thoughtful questions about your item</li>
              <li>• The conversation typically takes 3-5 minutes</li>
              <li>• You'll get personalized recommendations based on your responses</li>
              <li>• Choose to sell, donate, or add to your challenge calendar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}