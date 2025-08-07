import { useState, useRef } from "react";
import type { Route } from "./+types/let-go-buddy-page";
import { Button } from "~/common/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { CameraIcon, ExclamationTriangleIcon, SparklesIcon, TrashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { makeSSRClient } from "~/supa-client";
import { getLetGoSessionsCount } from "../queries";
import { redirect } from "react-router";
import { createLetGoBuddySession } from "../mutations";

const MAX_FREE_SESSIONS = 2;

const UPLOAD_SITUATIONS = [
  { value: "ready-to-declutter", label: "Ready to declutter" },
  { value: "feeling-overwhelmed", label: "Feeling overwhelmed" },
  { value: "moving-soon", label: "Moving soon" },
  { value: "spring-cleaning", label: "Spring cleaning" },
  { value: "need-space", label: "Need more space" },
  { value: "organizing", label: "Getting organized" }
];

export async function loader({ request }: Route.LoaderArgs) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  
  const sessionCount = await getLetGoSessionsCount(client, user.id);
  
  return {
    sessionCount,
    hasReachedLimit: sessionCount >= MAX_FREE_SESSIONS
  };
}

export async function action({ request }: Route.ActionArgs) {
  console.log('Let Go Buddy action called');
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return redirect('/auth/login');
  }
  
  const formData = await request.formData();
  const intent = formData.get("intent");
  console.log('Action intent:', intent);
  
  if (intent === "start-session") {
    console.log('Processing start-session intent');
    // Check session count first
    const sessionCount = await getLetGoSessionsCount(client, user.id);
    if (sessionCount >= MAX_FREE_SESSIONS) {
      console.log('Session limit reached');
      return { error: "You've reached the maximum number of free sessions" };
    }
    
    // Get form data
    const itemName = formData.get("itemName") as string;
    const situation = formData.get("situation") as string;
    const additionalInfo = formData.get("additionalInfo") as string;
    const file = formData.get("file") as File;
    
    console.log('Form data:', { itemName, situation, additionalInfo, fileSize: file?.size });
    
    // Validate required fields
    if (!itemName || !situation) {
      console.log('Missing required fields:', { itemName, situation });
      return { error: "Please fill in all required fields" };
    }

    // Create new session
    const sessionId = await createLetGoBuddySession(client, user.id);
    console.log('Created session with ID:', sessionId);
    
    // Handle image upload if file is provided
    if (file && file.size > 0) {
      console.log('Processing image upload');
      try {
        // Upload file to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${sessionId}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await client.storage
          .from('letgobuddy-product')
          .upload(`${user.id}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          console.log('Image uploaded successfully');
          // Get public URL
          const { data: { publicUrl } } = client.storage
            .from('letgobuddy-product')
            .getPublicUrl(`${user.id}/${fileName}`);
          
          // Store image URL and session data for analysis page to use
          // We'll use URL parameters to pass this data for now
          const params = new URLSearchParams({
            mode: 'chat',
            itemName: itemName || '',
            situation: situation || '',
            additionalInfo: additionalInfo || '',
            imageUrl: publicUrl
          });
          
          const redirectUrl = `/let-go-buddy/chat/${sessionId}?${params}`;
          console.log('Redirecting to:', redirectUrl);
          console.log('Full params:', params.toString());
          return redirect(redirectUrl);
        }
      } catch (error) {
        console.error('Error processing upload:', error);
      }
    }
    
    // Redirect without image if no file or upload failed
    const params = new URLSearchParams({
      mode: 'chat',
      itemName: itemName || '',
      situation: situation || '',
      additionalInfo: additionalInfo || ''
    });
    
    const redirectUrl = `/let-go-buddy/chat/${sessionId}?${params}`;
    console.log('Redirecting to (no image):', redirectUrl);
    console.log('Full params (no image):', params.toString());
    return redirect(redirectUrl);
  }
  
  return null;
}

export default function LetGoBuddyPage({ loaderData, actionData }: Route.ComponentProps) {
  const { sessionCount, hasReachedLimit } = loaderData;
  
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

  const handleSubmit = (e: React.FormEvent) => {
    console.log('Form submitted');
    if (!uploadedFile || !itemName || !situation) {
      console.log('Validation failed:', { uploadedFile: !!uploadedFile, itemName, situation });
      e.preventDefault();
      alert('Please fill in all required fields and upload an image.');
      return;
    }
    setIsUploading(true);
    console.log('Form validation passed, submitting...');
    // Let the form submit naturally to the server action
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <SparklesIcon className="w-8 h-8 text-blue-500" />
          <h1 className="text-4xl font-bold text-gray-900">Let Go Buddy</h1>
        </div>
        <p className="text-xl text-gray-600 mb-6">
          Your AI decluttering companion. Get personalized guidance to make confident decisions about your belongings.
        </p>
        
        {/* Usage Counter */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant={hasReachedLimit ? "destructive" : "secondary"} className="text-sm">
            {sessionCount}/{MAX_FREE_SESSIONS} Free Sessions Used
          </Badge>
        </div>
      </div>

      {/* Main Action Card */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">Start Your Decluttering Journey</CardTitle>
          <p className="text-gray-600">
            Upload a photo of an item you're considering letting go, and I'll help you make the right decision.
          </p>
        </CardHeader>
        <CardContent>
          {hasReachedLimit ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-4">
                <ExclamationTriangleIcon className="w-6 h-6" />
                <p className="font-medium">Free session limit reached</p>
              </div>
              <p className="text-gray-600 mb-6">
                You've used all {MAX_FREE_SESSIONS} of your free Let Go Buddy sessions. 
                Consider upgrading to continue your decluttering journey!
              </p>
              <Button disabled className="bg-gray-300 cursor-not-allowed">
                <CameraIcon className="w-5 h-5 mr-2" />
                Upload Photo (Premium Feature)
              </Button>
            </div>
          ) : (
            <form method="post" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              <input type="hidden" name="intent" value="start-session" />
              
              {/* Error Display */}
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">{actionData.error}</p>
                </div>
              )}
              
              {/* File Upload */}
              <div>
                <label htmlFor="photo-upload" className="block text-sm font-medium mb-2">Item Photo *</label>
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
                        className="w-48 h-48 object-cover rounded-lg border mx-auto block"
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  id="photo-upload"
                  name="file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Item Name */}
              <div>
                <label htmlFor="item-name" className="block text-sm font-medium mb-2">What is this item? *</label>
                <Input
                  id="item-name"
                  name="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Vintage leather jacket, Coffee maker, etc."
                  required
                />
              </div>

              {/* Situation */}
              <div>
                <label className="block text-sm font-medium mb-2">What brings you here today? *</label>
                <Select value={situation} onValueChange={setSituation} required>
                  <SelectTrigger>
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
                <input type="hidden" name="situation" value={situation} />
              </div>

              {/* Additional Info */}
              <div>
                <label htmlFor="additional-info" className="block text-sm font-medium mb-2">Any additional context? (Optional)</label>
                <Textarea
                  id="additional-info"
                  name="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Tell me more about this item or your situation..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={!uploadedFile || !itemName || !situation || isUploading}
                size="lg"
                className="w-full bg-[#91a453] text-[#fcffe7] hover:bg-[#D4DE95] hover:text-[#3D4127]"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Starting Session...
                  </>
                ) : (
                  <>
                    <span className="mr-2">Start New Session</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                {MAX_FREE_SESSIONS - sessionCount} free session{MAX_FREE_SESSIONS - sessionCount !== 1 ? 's' : ''} remaining
              </p>

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
            </form>
          )}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <SparklesIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-gray-600">
              Get insights into your emotional attachment and usage patterns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CameraIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Photo-Based Sessions</h3>
            <p className="text-sm text-gray-600">
              Simply upload a photo to start your decluttering conversation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">Joy</span>
            </div>
            <h3 className="font-semibold mb-2">Personal Coach</h3>
            <p className="text-sm text-gray-600">
              Chat with Joy, your empathetic AI decluttering companion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {sessionCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{sessionCount}</p>
                <p className="text-sm text-gray-600">Sessions Completed</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Ready for more?</p>
                <p className="text-sm text-blue-600">
                  {hasReachedLimit ? "Upgrade to continue" : "Keep decluttering!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}