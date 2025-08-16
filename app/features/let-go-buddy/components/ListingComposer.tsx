import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/common/components/ui/select';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Badge } from '~/common/components/ui/badge';
import { useToast } from '~/common/components/ui/use-toast';
import { 
  Sparkles, 
  Copy, 
  Languages, 
  Loader2, 
  Plus, 
  X, 
  ExternalLink,
  CheckCircle 
} from 'lucide-react';
import type { ListingComposerProps, Language } from '../types';

const availableLanguages: Language[] = ['en', 'ko'];
const toneOptions = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'plain', label: 'Plain/Professional' }
];

export function ListingComposer({ 
  item, 
  onListingGenerate, 
  languages = ['en'], 
  disabled = false 
}: ListingComposerProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: item?.title || '',
    condition: item?.condition || 'good',
    features: [] as string[],
    selectedLanguages: languages,
    tone: 'friendly' as 'friendly' | 'plain'
  });
  const [newFeature, setNewFeature] = useState('');
  const [generatedListings, setGeneratedListings] = useState<any>(null);

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleLanguageToggle = (lang: Language) => {
    setFormData(prev => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(lang)
        ? prev.selectedLanguages.filter(l => l !== lang)
        : [...prev.selectedLanguages, lang]
    }));
  };

  const handleGenerate = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter an item title",
        variant: "destructive"
      });
      return;
    }

    if (formData.selectedLanguages.length === 0) {
      toast({
        title: "Language Required", 
        description: "Please select at least one language",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/listing-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          condition: formData.condition,
          features: formData.features,
          locale_from: 'en',
          locales_to: formData.selectedLanguages,
          tone: formData.tone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate listings');
      }

      const result = await response.json();
      console.log('Generated listings:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Failed to generate listings');
      }

      setGeneratedListings(result.data.listings);
      
      // Call the callback if provided
      if (onListingGenerate && result.data.listings) {
        const listingsArray = Object.entries(result.data.listings).map(([lang, listing]: [string, any]) => ({
          listing_id: `${Date.now()}-${lang}`,
          item_id: item?.item_id || null,
          lang: lang as Language,
          title: listing.title,
          body: listing.body,
          hashtags: listing.hashtags,
          created_at: new Date().toISOString()
        }));
        onListingGenerate(listingsArray);
      }

      toast({
        title: "Listings Generated! ✨",
        description: `Created listings in ${formData.selectedLanguages.join(' and ')}`,
        className: "bg-green-50 border-green-200"
      });

    } catch (error) {
      console.error('Error generating listings:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied! 📋",
        description: "Listing copied to clipboard",
        className: "bg-blue-50 border-blue-200"
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Please copy manually",
        variant: "destructive"
      });
    }
  };

  const createMarketplaceListing = (listing: any) => {
    const params = new URLSearchParams({
      from_lgb: 'true',
      title: listing.title,
      description: listing.body,
      category: item?.category || 'Other',
      images: JSON.stringify(item?.photos || []),
      price_mid: item?.price_mid?.toString() || ''
    });
    window.open(`/secondhand/submit-a-listing?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Generate Marketplace Listings</h3>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Item Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., iPhone 13 Pro Max 256GB"
              disabled={disabled}
            />
          </div>

          {/* Condition */}
          <div>
            <Label htmlFor="condition">Condition *</Label>
            <Select 
              value={formData.condition} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent - Like new</SelectItem>
                <SelectItem value="good">Good - Minor wear</SelectItem>
                <SelectItem value="fair">Fair - Some wear</SelectItem>
                <SelectItem value="poor">Poor - Heavy wear</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Features */}
          <div>
            <Label>Key Features (Optional)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="e.g., Original box, Fast charging"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                disabled={disabled}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddFeature}
                disabled={disabled || !newFeature.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {feature}
                  <button
                    onClick={() => handleRemoveFeature(feature)}
                    className="hover:text-red-600"
                    disabled={disabled}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <Label>Languages *</Label>
            <div className="flex gap-4 mt-2">
              {availableLanguages.map((lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox
                    id={lang}
                    checked={formData.selectedLanguages.includes(lang)}
                    onCheckedChange={() => handleLanguageToggle(lang)}
                    disabled={disabled}
                  />
                  <Label htmlFor={lang} className="flex items-center gap-1">
                    <Languages className="w-4 h-4" />
                    {lang === 'en' ? 'English' : 'Korean'}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <Label htmlFor="tone">Tone</Label>
            <Select 
              value={formData.tone} 
              onValueChange={(value: 'friendly' | 'plain') => setFormData(prev => ({ ...prev, tone: value }))}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={disabled || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Listings...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Listings
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Listings */}
      {generatedListings && (
        <div className="space-y-4">
          {Object.entries(generatedListings).map(([lang, listing]: [string, any]) => (
            <Card key={lang} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold">
                    {lang === 'en' ? '🇺🇸 English' : '🇰🇷 Korean'} Listing
                  </h4>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${listing.title}\n\n${listing.body}\n\n${listing.hashtags.map((tag: string) => `#${tag}`).join(' ')}`)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => createMarketplaceListing(listing)}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Create Listing
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Title</Label>
                  <p className="text-lg font-semibold">{listing.title}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    value={listing.body}
                    readOnly
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Hashtags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {listing.hashtags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}