import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../../common/components/ui/avatar";
import { useNavigate } from "react-router";

const situations = [
  "I'm moving soon",
  "I need more space",
  "I'm just tidying up",
  "I'm downsizing",
  "I'm going minimalist",
];

const declutterPlan = [
  "Day 1: Organize your closet",
  "Day 2: Check your kitchen",
  "Day 3: Review appliances",
  "Day 4: Books & papers",
  "Day 5: Miscellaneous items",
];

// Emotional attachment questions
const emotionalQuestions = [
  "When was the last time you used this item?",
  "Does this item remind you of a special memory?",
  "Would you buy this item again if you lost it?",
  "Do you feel guilty about getting rid of it?",
  "Does this item represent who you are or want to be?",
];

// Environmental impact data
const environmentalImpact: Record<string, { co2: number; landfill: string; recyclable: boolean }> = {
  "Electronics": { co2: 25, landfill: "High", recyclable: true },
  "Clothing": { co2: 15, landfill: "Medium", recyclable: true },
  "Books": { co2: 5, landfill: "Low", recyclable: true },
  "Furniture": { co2: 30, landfill: "High", recyclable: false },
  "Kitchen Items": { co2: 10, landfill: "Medium", recyclable: true },
};

const mockAnalysis = [
  {
    photo: "/sample.png",
    name: "Electric Kettle",
    recommendation: "Donate (small + rarely used)",
    suggestion: "Give & Glow recommended",
    category: "Electronics",
    emotionalScore: 3,
    costBenefit: {
      originalPrice: 800,
      currentValue: 250,
      maintenanceCost: 0,
      spaceValue: 50,
    },
    aiListing: {
      title: "Electric Kettle – Still in great shape!",
      desc: "Used gently, perfect for daily tea or coffee. Clean and fully functional.",
      price: "THB 250",
      location: "Chiang Mai",
    },
  },
];

export default function LetGoBuddyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [showListing, setShowListing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showDeclutterPlan, setShowDeclutterPlan] = useState(false);
  const [showEmotionalAssessment, setShowEmotionalAssessment] = useState(false);
  const [showCostBenefit, setShowCostBenefit] = useState(false);
  const [showEnvironmentalImpact, setShowEnvironmentalImpact] = useState(false);
  const [emotionalAnswers, setEmotionalAnswers] = useState<number[]>([]);

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

  // Handle AI analysis generation
  const handleGenerateAnalysis = async () => {
    if (!selectedSituation) {
      alert("Please select your situation first");
      return;
    }
    
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one image first");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  // Handle declutter plan generation
  const handleGenerateDeclutterPlan = () => {
    setShowDeclutterPlan(true);
  };

  // Handle emotional assessment
  const handleEmotionalAssessment = () => {
    setShowEmotionalAssessment(true);
    setEmotionalAnswers(new Array(emotionalQuestions.length).fill(0));
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
    return Math.round((total / (emotionalQuestions.length * 5)) * 100);
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
        location: selectedItem.aiListing.location,
        images: uploadedFiles, // Pass the uploaded images
        category: selectedItem.category || "Electronics",
        condition: "Used - Good",
        aiGenerated: true,
        originalItem: selectedItem
      };

      // Navigate to submit-a-listing-page with the data
      navigate("/secondhand/submit-a-listing", { 
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
      // Generate alternative suggestions for the same item
      const alternativeSuggestions = [
        {
          title: `${selectedItem.name} – Excellent condition, ready to use!`,
          desc: "Well-maintained item in great shape. Perfect for daily use or as a gift.",
          price: "THB 300",
          location: "Chiang Mai",
        },
        {
          title: `${selectedItem.name} – Bargain price for quick sale!`,
          desc: "Selling at a great price to make room. Still works perfectly, just need space.",
          price: "THB 180",
          location: "Chiang Mai",
        },
        {
          title: `${selectedItem.name} – Premium quality, barely used!`,
          desc: "High-quality item with minimal wear. Like new condition, great value.",
          price: "THB 350",
          location: "Chiang Mai",
        },
        {
          title: `${selectedItem.name} – Perfect for students or budget-conscious buyers!`,
          desc: "Affordable option that doesn't compromise on quality. Great for those on a budget.",
          price: "THB 220",
          location: "Chiang Mai",
        }
      ];

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
        location: selectedItem.aiListing.location || "Chiang Mai",
        images: uploadedFiles,
        category: selectedItem.category || "Electronics",
        condition: "Used - Good",
        aiGenerated: true,
        isGiveaway: true,
        originalItem: selectedItem
      };

      // Navigate to submit-a-listing-page with free giveaway data
      navigate("/secondhand/submit-a-listing", { 
        state: { 
          prefillData: giveawayData,
          fromLetGoBuddy: true,
          isGiveaway: true
        } 
      });
      
      // Close the popup
      setShowListing(false);
    }
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
          <p className="text-gray-500 mb-4">Upload 1–5 photos of the item you want to declutter.</p>
          
          {/* Photo tips */}
          <div className="bg-purple-50 border border-primary/20 rounded-lg p-4 mb-4 w-full">
            <div className="font-medium text-primary-foreground mb-2">📸 Tips for better AI analysis:</div>
            <ul className="text-sm text-primary-foreground/80 space-y-1">
              <li>• Take photos from different angles (front, back, sides)</li>
              <li>• Include close-ups of any damage or wear</li>
              <li>• Show brand names and model numbers clearly</li>
              <li>• Ensure good lighting for clear visibility</li>
              <li>• Include the item in context (e.g., size reference)</li>
            </ul>
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
        </CardContent>
      </Card>

      {/* Step 2: Situation Selection */}
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">Step 2</div>
        <div className="mb-2">Select your current situation</div>
        <div className="flex flex-wrap gap-3 mb-4">
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
        
        {/* Generate AI Analysis Button */}
        <Button 
          onClick={handleGenerateAnalysis}
          disabled={!selectedSituation || uploadedFiles.length === 0 || isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Generating AI Analysis...
            </>
          ) : (
            <>
              <span className="mr-2">🤖</span>
              Generate AI Analysis
            </>
          )}
        </Button>
      </div>

      {/* Step 3: Analyzing */}
      {isAnalyzing && (
        <div className="mb-8">
          <div className="font-semibold text-lg mb-2">Step 3</div>
          <div className="flex items-center gap-2">
            <span className="animate-spin">🧠</span>
            Analyzing your items... <span>✨</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Our AI is examining your photos and situation to provide personalized recommendations...
          </div>
        </div>
      )}

      {/* Analysis Result Cards */}
      {analysisComplete && (
        <div className="space-y-6 mb-12">
          <div className="font-semibold text-lg mb-4">Analysis Complete! 🎉</div>
          {items.map((item, idx) => (
            <div key={idx} className="bg-white border rounded-xl p-5 flex gap-4 items-center shadow-sm">
              <img src={item.photo} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">📸 Photo: {item.name}</div>
                <div className="text-gray-600 mb-1">Recognition: <span className="font-medium">"{item.name}"</span></div>
                <div className="mb-2">Recommendation: <span className="font-medium">{item.recommendation}</span></div>
                
                {/* Decision Helper Buttons */}
                <div className="flex gap-2 flex-wrap mb-3">
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateDeclutterPlan}
                  >
                    📅 Get Declutter Plan
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
                    💭 Emotional Check
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCostBenefitAnalysis}
                    className="text-xs"
                  >
                    💰 Cost Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEnvironmentalImpact}
                    className="text-xs"
                  >
                    🌱 Eco Impact
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
              <button 
                className="px-4 py-2 rounded bg-teal-500 text-white"
                onClick={handlePostAfterEditing}
              >
                Post after editing
              </button>
              <button 
                className="px-4 py-2 rounded bg-gray-200 text-black"
                onClick={handleSeeAnotherSuggestion}
              >
                See another suggestion
              </button>
              <button 
                className="px-4 py-2 rounded bg-fuchsia-300 text-white"
                onClick={handleFreeGiveaway}
              >
                🎁 Free Giveaway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emotional Assessment Popup */}
      {showEmotionalAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full relative shadow-lg max-h-[80vh] overflow-y-auto">
            <button className="absolute top-3 right-3 text-2xl" onClick={() => setShowEmotionalAssessment(false)}>×</button>
            <div className="mb-6 text-lg font-bold flex items-center gap-2">💭 Emotional Attachment Assessment</div>
            <div className="space-y-4">
              {emotionalQuestions.map((question, index) => (
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
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="font-medium">Emotional Attachment Score: {calculateEmotionalScore()}%</div>
                <div className="text-sm text-gray-600 mt-1">
                  {calculateEmotionalScore() > 70 ? "High attachment - Consider keeping" :
                   calculateEmotionalScore() > 40 ? "Moderate attachment - Think carefully" :
                   "Low attachment - Safe to let go"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost-Benefit Analysis Popup */}
      {showCostBenefit && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative shadow-lg">
            <button className="absolute top-3 right-3 text-2xl" onClick={() => setShowCostBenefit(false)}>×</button>
            <div className="mb-6 text-lg font-bold flex items-center gap-2">💰 Cost-Benefit Analysis</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Original Price:</span>
                <span>THB {mockAnalysis[0].costBenefit.originalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Value:</span>
                <span>THB {mockAnalysis[0].costBenefit.currentValue}</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance Cost:</span>
                <span>THB {mockAnalysis[0].costBenefit.maintenanceCost}</span>
              </div>
              <div className="flex justify-between">
                <span>Space Value (per month):</span>
                <span>THB {mockAnalysis[0].costBenefit.spaceValue}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold">
                <span>Net Loss:</span>
                <span className="text-red-600">THB {mockAnalysis[0].costBenefit.originalPrice - mockAnalysis[0].costBenefit.currentValue}</span>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded">
                <div className="text-sm">
                  <strong>Recommendation:</strong> Selling now would recover {Math.round((mockAnalysis[0].costBenefit.currentValue / mockAnalysis[0].costBenefit.originalPrice) * 100)}% of your investment.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environmental Impact Popup */}
      {showEnvironmentalImpact && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative shadow-lg">
            <button className="absolute top-3 right-3 text-2xl" onClick={() => setShowEnvironmentalImpact(false)}>×</button>
            <div className="mb-6 text-lg font-bold flex items-center gap-2">🌱 Environmental Impact</div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-medium mb-2">By donating/selling this item:</div>
                <div className="text-sm space-y-1">
                  <div>• Saves {environmentalImpact[mockAnalysis[0].category].co2}kg CO2 emissions</div>
                  <div>• Reduces landfill waste</div>
                  <div>• Extends item's useful life</div>
                  <div>• Supports circular economy</div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium mb-2">Best disposal method:</div>
                <div className="text-sm">
                  {environmentalImpact[mockAnalysis[0].category].recyclable 
                    ? "♻️ Recycle or donate to extend life"
                    : "🔄 Repurpose or upcycle if possible"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Declutter Plan Section - Only shown when user requests it */}
      {showDeclutterPlan && (
        <div className="bg-gray-50 border rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-lg">📅 Your 5-Day Declutter Plan</div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeclutterPlan(false)}
            >
              × Close
            </Button>
          </div>
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
      )}

    </div>
  );
} 