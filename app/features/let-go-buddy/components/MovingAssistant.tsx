import React, { useState } from 'react';
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
} from 'lucide-react';
import { ItemUploader } from './ItemUploader';
import { browserClient } from '~/supa-client';
import type { LgbSession } from '../types';

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
  const { toast } = useToast();

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
    setCategoryImages(prev => ({
      ...prev,
      [categoryId]: images
    }));
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
      
      // TODO: Save plan to database when table is created
      // await browserClient
      //   .from('lgb_moving_plans')
      //   .insert({
      //     session_id: session.session_id,
      //     plan_data: result.data,
      //     inventory_summary: inventory
      //   });

      if (onPlanGenerated) {
        onPlanGenerated(result.data);
      }

      toast({
        title: "Moving plan generated!",
        description: "Your personalized moving schedule is ready"
      });

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
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {categoryImages[categoryId]?.length > 0 ? 'Edit' : 'Add'} Photos
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
                <>Generating Plan...</>
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