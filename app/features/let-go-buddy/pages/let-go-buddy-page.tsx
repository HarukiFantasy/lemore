import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../../common/components/ui/avatar";

const situations = [
  "I'm moving soon",
  "I need more space",
  "I'm just tidying up",
];

const declutterPlan = [
  "Day 1: Organize your closet",
  "Day 2: Check your kitchen",
  "Day 3: Review appliances",
  "Day 4: Books & papers",
  "Day 5: Miscellaneous items",
];

const mockAnalysis = [
  {
    photo: "/sample.png",
    name: "Electric Kettle",
    recommendation: "Donate (small + rarely used)",
    suggestion: "Give & Glow recommended",
    aiListing: {
      title: "Electric Kettle – Still in great shape!",
      desc: "Used gently, perfect for daily tea or coffee. Clean and fully functional.",
      price: "THB 250",
      location: "Chiang Mai",
    },
  },
];

export default function LetGoBuddyPage() {
  const [step, setStep] = useState(1);
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [showListing, setShowListing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 5) {
      alert("You can upload maximum 5 files");
      return;
    }
    
    setUploadedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Placeholder for uploaded images and analysis
  const items = mockAnalysis;

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
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
            <span className="text-3xl">📷</span>
            Upload your items
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-gray-500 mb-4">Upload 1–5 items you want to declutter.</p>
          
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
        </CardContent>
      </Card>

      {/* Step 2: Situation Selection */}
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">Step 2</div>
        <div className="mb-2">Select your current situation</div>
        <div className="flex flex-wrap gap-3 mb-2">
          {situations.map((s) => (
            <Button
              key={s}
              variant={selectedSituation === s ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSituation(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Step 3: Analyzing */}
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">Step 3</div>
        <div className="flex items-center gap-2">Analyzing your items... <span>🧠✨</span></div>
      </div>

      {/* Analysis Result Cards */}
      <div className="space-y-6 mb-12">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white border rounded-xl p-5 flex gap-4 items-center shadow-sm">
            <img src={item.photo} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />
            <div className="flex-1">
              <div className="font-semibold text-lg mb-1">📸 Photo: {item.name}</div>
              <div className="text-gray-600 mb-1">Recognition: <span className="font-medium">"{item.name}"</span></div>
              <div className="mb-2">Recommendation: <span className="font-medium">{item.recommendation}</span></div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => { setShowListing(true); setSelectedItem(item); }}
                >
                  Create Listing
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  Keep
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Generated Listing Popup */}
      {showListing && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative shadow-lg">
            <button className="absolute top-3 right-3 text-2xl" onClick={() => setShowListing(false)}>×</button>
            <div className="mb-4 text-lg font-bold flex items-center gap-2">📝 AI Generated Listing</div>
            <div className="prose mb-4">
              <h2>{selectedItem.aiListing.title}</h2>
              <p>{selectedItem.aiListing.desc}</p>
              <p><b>💰 Suggested Price:</b> {selectedItem.aiListing.price}</p>
              <p><b>📍 Location:</b> {selectedItem.aiListing.location}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-blue-600 text-white">Post after editing</button>
              <button className="px-4 py-2 rounded bg-gray-200 text-black">See another suggestion</button>
            </div>
          </div>
        </div>
      )}

      {/* Declutter Plan Section */}
      <div className="bg-gray-50 border rounded-xl p-6 mb-8">
        <div className="font-semibold text-lg mb-2">📅 Your 5-Day Declutter Plan</div>
        <div className="mb-2 text-gray-600">Start with small steps:</div>
        <ul className="list-disc pl-6 mb-4">
          {declutterPlan.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-gray-200 text-black">Download Plan as Image</button>
          <button className="px-3 py-1 rounded bg-gray-200 text-black">Sync to Calendar</button>
        </div>
      </div>

      {/* My Page Summary */}
      <div className="bg-white border rounded-xl p-6 mb-4">
        <div className="font-semibold text-lg mb-2">My Decluttered Items</div>
        <div className="mb-1 text-gray-600">Estimated space freed: <b>30L</b></div>
        <div className="mb-1 text-gray-600">Donations: <b>2</b> / Secondhand sales: <b>1</b> / Carbon saved: <b>1.2kg</b></div>
        <div className="text-gray-500 text-sm">(This section will show your declutter stats and item history.)</div>
      </div>
    </div>
  );
} 