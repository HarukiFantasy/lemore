import React, { useState, useEffect } from 'react';
import { Card } from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { useToast } from '~/common/components/ui/use-toast';
import { 
  Package, 
  Shirt, 
  Laptop, 
  UtensilsCrossed, 
  Book, 
  Sofa,
  Gamepad2,
  Heart,
  FileText,
  Home,
  Check,
  Upload,
  Sparkles,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react';
import { ItemUploader } from './ItemUploader';
import { browserClient } from '~/supa-client';
import { getAIUsageCount } from '../utils/aiUsage';

interface MovingCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  images: string[];
  notes?: string;
}

const categories: MovingCategory[] = [
  { id: 'furniture', name: 'Furniture', icon: Sofa, description: 'Beds, sofas, tables, chairs', images: [] },
  { id: 'clothing', name: 'Clothing', icon: Shirt, description: 'Clothes, shoes, accessories', images: [] },
  { id: 'electronics', name: 'Electronics', icon: Laptop, description: 'TVs, computers, gadgets', images: [] },
  { id: 'kitchen', name: 'Kitchen', icon: UtensilsCrossed, description: 'Appliances, dishes, cookware', images: [] },
  { id: 'books', name: 'Books & Media', icon: Book, description: 'Books, documents, albums', images: [] },
  { id: 'decor', name: 'Decor', icon: Home, description: 'Art, plants, decorations', images: [] },
  { id: 'toys', name: 'Toys & Games', icon: Gamepad2, description: 'Toys, games, sports equipment', images: [] },
  { id: 'sentimental', name: 'Sentimental', icon: Heart, description: 'Keepsakes, memories, gifts', images: [] },
  { id: 'documents', name: 'Important Docs', icon: FileText, description: 'Legal papers, certificates', images: [] },
  { id: 'other', name: 'Other Items', icon: Package, description: 'Everything else', images: [] }
];

interface MovingAssistantProps {
  session: any; // Using any to handle the database session object which might have different properties
  onPlanGenerated?: (plan: any) => void;
}

export function MovingAssistant({ session, onPlanGenerated }: MovingAssistantProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categoryImages, setCategoryImages] = useState<Record<string, string[]>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [movingPlan, setMovingPlan] = useState<any>(null);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ total: number; maxFree: number; canUse: boolean }>({ total: 0, maxFree: 2, canUse: true });
  const { toast } = useToast();
  
  // Check AI usage on component mount
  useEffect(() => {
    const checkAiUsage = async () => {
      try {
        const { data: { user } } = await browserClient.auth.getUser();
        if (!user) return;

        const usage = await getAIUsageCount(user.id);
        setAiUsage({ 
          total: usage.total, 
          maxFree: usage.maxFree, 
          canUse: usage.canUse 
        });

      } catch (error) {
        console.error('Error checking AI usage:', error);
      }
    };

    checkAiUsage();
  }, [session?.session_id]);

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
      // Clear images when deselecting
      setCategoryImages(prev => {
        const updated = { ...prev };
        delete updated[categoryId];
        return updated;
      });
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleImageUpload = (categoryId: string, images: string[]) => {
    // Check if free user is trying to upload to more than 2 categories
    const categoriesWithImages = Object.keys(categoryImages).filter(id => categoryImages[id].length > 0);
    const isNewCategory = !categoryImages[categoryId] || categoryImages[categoryId].length === 0;
    
    if (aiUsage.total < aiUsage.maxFree && isNewCategory && categoriesWithImages.length >= 2) {
      toast({
        title: "Photo Upload Limit",
        description: "Free users can only upload photos for 2 categories. Remove photos from another category first.",
        variant: "destructive"
      });
      return;
    }
    
    setCategoryImages(prev => ({
      ...prev,
      [categoryId]: images
    }));
  };

  const addToCalendar = async () => {
    if (!movingPlan || !session.move_date) {
      toast({
        title: "Cannot add to calendar",
        description: "No moving plan or move date available",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToCalendar(true);
    
    try {
      const moveDate = new Date(session.move_date);
      const calendarEntries = [];

      // Convert each week's tasks into calendar entries
      if (movingPlan.timeline) {
        for (const week of movingPlan.timeline) {
          // Calculate the start date for this week (working backwards from move date)
          const weekStartDate = new Date(moveDate);
          weekStartDate.setDate(moveDate.getDate() - (7 * (movingPlan.timeline.length - week.week)));
          
          // Add each task as a separate calendar entry
          if (week.tasks) {
            for (let taskIndex = 0; taskIndex < week.tasks.length; taskIndex++) {
              const task = week.tasks[taskIndex];
              const taskDate = new Date(weekStartDate);
              taskDate.setDate(weekStartDate.getDate() + taskIndex + 1); // Spread tasks across the week
              
              calendarEntries.push({
                name: `📦 Week ${week.week}: ${task}`,
                scheduled_date: taskDate.toISOString()
              });
            }
          }
        }
      }

      // Add priority action items as high-priority tasks
      if (movingPlan.actionItems) {
        const urgentDate = new Date();
        urgentDate.setDate(urgentDate.getDate() + 1); // Tomorrow
        
        for (const actionItem of movingPlan.actionItems) {
          calendarEntries.push({
            name: `⚡ PRIORITY: ${actionItem}`,
            scheduled_date: urgentDate.toISOString()
          });
        }
      }

      // Get current user for calendar entries
      const { data: { user } } = await browserClient.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add user_id to all calendar entries
      const entriesWithUserId = calendarEntries.map(entry => ({
        name: entry.name,
        scheduled_date: entry.scheduled_date,
        user_id: user.id,
        completed: false
      }));

      console.log('Inserting calendar entries:', entriesWithUserId);

      // Insert calendar entries one by one to avoid bulk insert issues
      for (const entry of entriesWithUserId) {
        const { error: insertError } = await browserClient
          .from('challenge_calendar_items')
          .insert([entry]);
        
        if (insertError) {
          console.error('Insert error for entry:', entry, insertError);
          throw new Error(`Failed to add calendar entry: ${insertError.message}`);
        }
      }

      setAddedToCalendar(true);
      toast({
        title: "Added to calendar!",
        description: `${entriesWithUserId.length} moving tasks added to your challenge calendar`,
        className: "bg-green-50 border-green-200"
      });

    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast({
        title: "Failed to add to calendar",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const generateMovingPlan = async () => {
    if (selectedCategories.size === 0) {
      toast({
        title: "No categories selected",
        description: "Please select at least one category of items to move",
        variant: "destructive"
      });
      return;
    }

    // Check AI usage limits before generating plan
    const { data: { user } } = await browserClient.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate a moving plan",
        variant: "destructive"
      });
      return;
    }

    const aiUsage = await getAIUsageCount(user.id);
    if (!aiUsage.canUse) {
      toast({
        title: "AI Usage Limit Reached",
        description: `You've used ${aiUsage.total}/${aiUsage.maxFree} free AI features (${aiUsage.itemAnalyses} item analyses + ${aiUsage.movingPlans} moving plans). Please contact support for more.`,
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPlan(true);
    
    try {
      // Prepare inventory summary
      const inventory = Array.from(selectedCategories).map(catId => {
        const category = categories.find(c => c.id === catId);
        const images = categoryImages[catId] || [];
        return {
          category: category?.name,
          hasImages: images.length > 0,
          imageCount: images.length,
          images: images
        };
      });

      // Call AI to generate moving plan
      const response = await fetch('/api/ai/moving-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moveDate: session.move_date,
          region: session.region,
          inventory: inventory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate moving plan');
      }

      const result = await response.json();
      setMovingPlan(result.data);
      
      // Mark session as having AI plan generated (using generic update)
      await browserClient
        .from('lgb_sessions')
        .update({
          ai_plan_generated: true,
          ai_plan_generated_at: new Date().toISOString()
        } as any)
        .eq('session_id', session.session_id);

      if (onPlanGenerated) {
        onPlanGenerated(result.data);
      }

    } catch (error) {
      console.error('Error generating moving plan:', error);
      toast({
        title: "Plan generation failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  if (movingPlan) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold">Your Moving Plan</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>To: {session.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Move Date: {new Date(session.move_date!).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 space-y-4">
              {movingPlan.timeline?.map((week: any, index: number) => (
                <Card key={index} className="p-4">
                  <h3 className="font-semibold mb-2">Week {index + 1}</h3>
                  <ul className="space-y-2">
                    {week.tasks?.map((task: string, taskIndex: number) => (
                      <li key={taskIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{task}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            {/* Action Items */}
            {movingPlan.actionItems && (
              <Card className="p-4 bg-blue-50">
                <h3 className="font-semibold mb-2">Priority Actions</h3>
                <ul className="space-y-1">
                  {movingPlan.actionItems.map((item: string, index: number) => (
                    <li key={index} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Add to Calendar Button */}
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Stay on Track</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add your moving tasks to the challenge calendar for daily tracking and reminders
                </p>
                {!addedToCalendar ? (
                  <Button
                    onClick={addToCalendar}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    disabled={isAddingToCalendar}
                  >
                    {isAddingToCalendar ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding to Calendar...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Add to Calendar
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Added to Calendar!</span>
                    </div>
                    <Button 
                      onClick={() => window.location.href = '/let-go-buddy/challenges'}
                      variant="outline"
                      className="w-full"
                    >
                      View Calendar
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Tips */}
            {movingPlan.tips && (
              <Card className="p-4 bg-green-50">
                <h3 className="font-semibold mb-2">Moving Tips</h3>
                <ul className="space-y-1">
                  {movingPlan.tips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm">💡 {tip}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </Card>
        
        <Button
          onClick={() => setMovingPlan(null)}
          variant="outline"
        >
          Edit Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Select Categories */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Step 1: What items do you need to move?
        </h2>
        <p className="text-gray-600 mb-6">
          Select all categories that apply to your move
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategories.has(category.id);
            const hasImages = (categoryImages[category.id] || []).length > 0;
            
            return (
              <Card
                key={category.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isSelected ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasImages && (
                      <Badge variant="secondary" className="text-xs">
                        {categoryImages[category.id].length} pics
                      </Badge>
                    )}
                    {isSelected && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Step 2: Upload Images for Selected Categories */}
      {selectedCategories.size > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 2: Upload photos (optional)
          </h2>
          <p className="text-gray-600 mb-6">
            Add photos to help AI create a more accurate moving plan
            {aiUsage.total < aiUsage.maxFree && (
              <span className="block text-sm text-amber-600 mt-1">
                📸 Free users can upload photos for up to 2 categories maximum
              </span>
            )}
          </p>
          
          <div className="space-y-4">
            {Array.from(selectedCategories).map(categoryId => {
              const category = categories.find(c => c.id === categoryId);
              if (!category) return null;
              const Icon = category.icon;
              
              return (
                <Card key={categoryId} className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium">{category.name}</h3>
                    {categoryImages[categoryId]?.length > 0 && (
                      <Badge variant="secondary">
                        {categoryImages[categoryId].length} photos
                      </Badge>
                    )}
                  </div>
                  
                  {activeCategory === categoryId ? (
                    <div className="space-y-4">
                      <ItemUploader
                        onUpload={(photos) => handleImageUpload(categoryId, photos)}
                        maxPhotos={5}
                        existingPhotos={categoryImages[categoryId] || []}
                      />
                      <Button
                        onClick={() => setActiveCategory(null)}
                        variant="outline"
                        size="sm"
                      >
                        Done
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setActiveCategory(categoryId)}
                      variant="outline"
                      size="sm"
                      disabled={
                        aiUsage.total < aiUsage.maxFree && 
                        (!categoryImages[categoryId] || categoryImages[categoryId].length === 0) &&
                        Object.keys(categoryImages).filter(id => categoryImages[id].length > 0).length >= 2
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {categoryImages[categoryId]?.length > 0 ? 'Edit' : 'Add'} Photos
                      {aiUsage.total < aiUsage.maxFree && 
                       (!categoryImages[categoryId] || categoryImages[categoryId].length === 0) &&
                       Object.keys(categoryImages).filter(id => categoryImages[id].length > 0).length >= 2 && (
                        <span className="ml-1 text-xs">(Limit: 2)</span>
                      )}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* Step 3: Generate Plan */}
      {selectedCategories.size > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Ready to generate your moving plan?
            </h2>
            <p className="text-gray-600 mb-6">
              AI will create a personalized schedule based on your items and move date
            </p>
            <Button
              onClick={generateMovingPlan}
              size="lg"
              disabled={isGeneratingPlan}
              className="px-8"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Moving Plan
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}