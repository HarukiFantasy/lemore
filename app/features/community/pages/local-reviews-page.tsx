import { useState, useEffect } from "react";
import { useSearchParams, Form, useActionData } from "react-router";
import { z } from "zod";;
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/common/components/ui/dialog";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import { getLocalBusinesses, getLocalReviews } from "../queries";
import { createLocalReview } from "../mutation";
import { addNewBusiness } from "../mutation";
import { uploadBusinessImage } from "../mutation";
import { updateLocalBusiness } from "../mutation";
import type { Route } from "./+types/local-reviews-page";
import { makeSSRClient } from '~/supa-client';
import { LOCATIONS } from '~/constants';
import { BUSINESS_TYPES } from '../constants';
import { browserClient } from '~/supa-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";

// Schema definitions
const BusinessTypeSchema = z.enum(["All", "Restaurant", "Cafe", "Bar", "Shop", "Service", "Other"]);
const PriceRangeSchema = z.enum(["All", "$", "$$", "$$$", "$$$$"]);
const LocationSchema = z.enum(["Bangkok", "ChiangMai", "Phuket", "Pattaya", "Krabi", "HuaHin", "Koh Samui", "Other Cities"]);


export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const url = new URL(request.url);
  const location = url.searchParams.get("location");
  
  const businesses = await getLocalBusinesses(client);
  const reviews = await getLocalReviews(client);
  
  // Get current user
  const { data: { user } } = await client.auth.getUser();
  
  // Location filtering
  let filteredBusinesses = businesses;
  if (location && location !== "All Cities" && location !== "Other Cities") {
    filteredBusinesses = businesses.filter(business => business.location === location);
  }
  
  return { businesses: filteredBusinesses, reviews, location, user };
}

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in to write a review" };
  }
  
  const formData = await request.formData();
  const { content, rating, tags, businessId } = Object.fromEntries(formData);
  
  try {
    const data = await createLocalReview(client, { 
      content: content as string, 
      rating: parseInt(rating as string), 
      tags: tags as string, 
      businessId: parseInt(businessId as string) 
    });
    return { data };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return { error: "You have already reviewed this business" };
    }
    return { error: "Failed to submit review. Please try again." };
  }
} 
// Main component
export default function LocalReviewsPage({ loaderData }: Route.ComponentProps) {
  const { businesses, reviews, location, user } = loaderData;
  const actionData = useActionData<typeof action>();
  
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Close modal when action is successful
  useEffect(() => {
    if (actionData?.data) {
      setShowReviewForm(false);
      setSelectedBusiness(null);
      setReviewStep('select-business');
      setBusinessSearchQuery("");
      setNewReview({ rating: 5, review: "", priceRange: "$" as z.infer<typeof PriceRangeSchema>, tags: [] });
      setNewBusiness({
        name: "",
        type: "Restaurant" as z.infer<typeof BusinessTypeSchema>,
        location: urlLocation as z.infer<typeof LocationSchema>,
        priceRange: "$" as z.infer<typeof PriceRangeSchema>,
        tags: [],
        address: "",
        phone: "",
        website: "",
        description: "",
        city: ""
      });
      
      // Reload the page to show the new review
      window.location.reload();
    }
  }, [actionData]);
  const urlLocation = searchParams.get("location");
  const currentLocation = urlLocation || "Bangkok";
  
  // State variables
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = useState<z.infer<typeof BusinessTypeSchema>>(
    (searchParams.get("type") as z.infer<typeof BusinessTypeSchema>) || "All"
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<z.infer<typeof PriceRangeSchema>>(
    (searchParams.get("priceRange") as z.infer<typeof PriceRangeSchema>) || "All"
  );
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const [reviewStep, setReviewStep] = useState<'select-business' | 'write-review'>('select-business');
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    type: "Restaurant" as z.infer<typeof BusinessTypeSchema>,
    location: urlLocation as z.infer<typeof LocationSchema>,
    priceRange: "$" as z.infer<typeof PriceRangeSchema>,
    tags: [] as string[],
    address: "",
    phone: "",
    website: "",
    description: "",
    city: ""
  });
  const [newReview, setNewReview] = useState({
    rating: 5,
    review: "",
    priceRange: "$" as z.infer<typeof PriceRangeSchema>,
    tags: [] as string[]
  });
  const [businessTab, setBusinessTab] = useState('existing');
  const [newBusinessImage, setNewBusinessImage] = useState<File | null>(null);
  const [newBusinessImagePreview, setNewBusinessImagePreview] = useState<string | null>(null);
  const [addUploading, setAddUploading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Add state for edit mode and editing business
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [editingBusinessId, setEditingBusinessId] = useState<number | null>(null);

  const validBusinessTypes = BUSINESS_TYPES;
  const validPriceRanges: z.infer<typeof PriceRangeSchema>[] = ["All", "$", "$$", "$$$", "$$$$"];

  // Check if user has already reviewed a business
  const hasUserReviewedBusiness = (businessId: number) => {
    if (!user) return false;
    
    const hasReviewed = reviews.some((review: any) => {
      // In local_reviews_list_view, author field contains the user ID
      const reviewUserId = review.author;
      const matches = review.business_id === businessId && reviewUserId === user.id;
      return matches;
    });
    
    return hasReviewed;
  };


  // Filter businesses for the selection modal
  const filteredBusinessesForSelection = businesses.filter(business => 
    (business.name ?? "").toLowerCase().includes(businessSearchQuery.toLowerCase()) ||
    (business.type ?? "").toLowerCase().includes(businessSearchQuery.toLowerCase()) ||
    (business.location ?? "").toLowerCase().includes(businessSearchQuery.toLowerCase())
  );

  useEffect(() => {
    setNewBusiness(prev => ({ ...prev, location: urlLocation as z.infer<typeof LocationSchema> }));
  }, [urlLocation]);

  // Filter businesses based on current state
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = (business.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (
                            Array.isArray(business.tags) &&
                            business.tags.some(
                              (tag: any) => typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                          );
    const matchesType = selectedType === "All" || business.type === selectedType;
    const matchesLocation = !urlLocation || urlLocation === "Other Cities" || business.location === urlLocation;
    const matchesPrice = selectedPriceRange === "All" || business.price_range === selectedPriceRange;
    
    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateFilters(selectedType, value, selectedPriceRange);
  };

  const handleTypeChange = (type: z.infer<typeof BusinessTypeSchema>) => {
    setSelectedType(type);
    updateFilters(type, searchQuery, selectedPriceRange);
  };

  const handlePriceRangeChange = (range: z.infer<typeof PriceRangeSchema>) => {
    setSelectedPriceRange(range);
    updateFilters(selectedType, searchQuery, range);
  };

  // Update filters and URL
  const updateFilters = (newType: z.infer<typeof BusinessTypeSchema>, newSearch: string, newPriceRange: z.infer<typeof PriceRangeSchema>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (newType && newType !== "All") {
      newSearchParams.set("type", newType);
    } else {
      newSearchParams.delete("type");
    }
    
    if (newSearch) {
      newSearchParams.set("search", newSearch);
    } else {
      newSearchParams.delete("search");
    }
    
    if (newPriceRange && newPriceRange !== "All") {
      newSearchParams.set("priceRange", newPriceRange);
    } else {
      newSearchParams.delete("priceRange");
    }
    
    setSearchParams(newSearchParams);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedPriceRange("All");
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
  };

  // Clear specific filter
  const handleClearFilter = (filterType: 'search' | 'type' | 'priceRange') => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filterType === 'search') {
      newSearchParams.delete("search");
      setSearchQuery("");
    } else if (filterType === 'type') {
      newSearchParams.delete("type");
      setSelectedType("All");
    } else if (filterType === 'priceRange') {
      newSearchParams.delete("priceRange");
      setSelectedPriceRange("All");
    }
    setSearchParams(newSearchParams);
  };

  const handleSubmitReview = () => {
    if (selectedBusiness && newReview.review.trim()) {
      // TODO: Submit to backend
      setShowReviewForm(false);
      setSelectedBusiness(null);
      setNewReview({ rating: 5, review: "", priceRange: "$" as z.infer<typeof PriceRangeSchema>, tags: [] });
    }
  };

  const handleSubmitBusiness = () => {
    if (newBusiness.name.trim() && newBusiness.address.trim()) {
      // TODO: Submit to backend
      setNewBusiness({
        name: "",
        type: "Restaurant" as z.infer<typeof BusinessTypeSchema>,
        location: urlLocation as z.infer<typeof LocationSchema>,
        priceRange: "$" as z.infer<typeof PriceRangeSchema>,
        tags: [],
        address: "",
        phone: "",
        website: "",
        description: "",
        city: ""
      });
    }
  };

  // Edit handler
  const handleEditBusiness = (business: any) => {
    setNewBusiness({
      name: business.name || "",
      type: business.type || "Restaurant",
      location: business.location || "Bangkok",
      priceRange: business.price_range || "$",
      tags: business.tags || [],
      address: business.address || "",
      phone: business.phone || "",
      website: business.website || "",
      description: business.description || "",
      city: business.location || ""
    });
    setNewBusinessImagePreview(business.image || null);
    setEditingBusinessId(business.id);
    setIsEditingBusiness(true);
    setBusinessTab('add');
    setShowReviewForm(true);
    setReviewStep('select-business');
  };

  // Update business mutation
  async function handleSaveEditBusiness() {
    setAddError(null);
    setAddUploading(true);
    try {
      let imageUrl = newBusinessImagePreview;
      if (newBusinessImage) {
        imageUrl = await uploadBusinessImage(browserClient, newBusinessImage);
        if (!imageUrl) throw new Error('Image upload failed');
      }
      // Use updateLocalBusiness mutation
      await updateLocalBusiness(browserClient, editingBusinessId as number, {
        name: newBusiness.name,
        type: newBusiness.type,
        location: newBusiness.location,
        price_range: newBusiness.priceRange,
        tags: newBusiness.tags,
        address: newBusiness.address,
        description: newBusiness.description,
        image: imageUrl,
      });
      setAddUploading(false);
      setIsEditingBusiness(false);
      setEditingBusinessId(null);
      setShowReviewForm(false);
      window.location.reload(); // Or refresh business list state
    } catch (err: any) {
      setAddError(err.message || 'Failed to update business');
      setAddUploading(false);
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // 비즈니스별 리뷰 매핑 - 필터링된 비즈니스만 사용
  const businessReviewPairs = filteredBusinesses.map((business) => {
    const businessReviews = reviews.filter((r: any) => r.business_id === business.id);
    return { business, reviews: businessReviews };
  });

  // Add New Business: handle Continue (with image upload)
  const handleAddBusinessContinue = async () => {
    console.log('handleAddBusinessContinue started');
    setAddError(null);
    setAddUploading(true);
    try {
      console.log('About to call addNewBusiness with:', { 
        businessData: newBusiness, 
        hasImage: !!newBusinessImage,
        imageName: newBusinessImage?.name 
      });
      const inserted = await addNewBusiness(browserClient, newBusiness, newBusinessImage || undefined);
      console.log('addNewBusiness succeeded:', inserted);
      setSelectedBusiness(inserted);
      setReviewStep('write-review');
    } catch (error) {
      console.error('addNewBusiness failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setAddError(error instanceof Error ? error.message : 'Failed to register business.');
    }
    setAddUploading(false);
  };

  return (
    <div className="w-full md:w-4/5 mx-auto px-5 py-6 md:py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Local Reviews</h1>
        <p className="text-gray-600">
          Discover and review the best local businesses {!urlLocation ? "across all locations" : `in ${currentLocation}`}</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Businesses</label>
            <Input
              placeholder="Search by business name or tags..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filters */}
          {/* Mobile: Select Dropdowns in one row */}
          <div className="block md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {validBusinessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <Select value={selectedPriceRange} onValueChange={handlePriceRangeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {validPriceRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Desktop: Button Filters */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <div className="flex flex-wrap gap-2">
                  {validBusinessTypes.map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTypeChange(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {validPriceRanges.map((range) => (
                    <Button
                      key={range}
                      variant={selectedPriceRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePriceRangeChange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active filters display and clear */}
      {(searchQuery || selectedType !== "All" || selectedPriceRange !== "All") && (
        <div className="mb-6 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchQuery && (
            <div className="flex items-center gap-1  bg-gray-200/70 text-gray-700 px-3 py-1 rounded-full text-sm">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={() => handleClearFilter('search')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </div>
          )}
          {selectedType !== "All" && (
            <div className="flex items-center gap-1  bg-gray-200/70 text-gray-700 px-3 py-1 rounded-full text-sm">
              <span>Type: {selectedType}</span>
              <button
                onClick={() => handleClearFilter('type')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          )}
          {selectedPriceRange !== "All" && (
            <div className="flex items-center gap-1  bg-gray-200/70 text-gray-700 px-3 py-1 rounded-full text-sm">
              <span>Price: {selectedPriceRange}</span>
              <button
                onClick={() => handleClearFilter('priceRange')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          )}
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results Statistics and Action Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold text-blue-600">{businessReviewPairs.length}</span> businesses
          {!urlLocation ? " across all locations" : urlLocation === "Other Cities" ? " across all cities" : ` in ${currentLocation}`}
          {(searchQuery || selectedType !== "All" || selectedPriceRange !== "All") && (
            <span className="ml-2">
              {searchQuery && ` for "${searchQuery}"`}
              {selectedType !== "All" && ` in ${selectedType}`}
              {selectedPriceRange !== "All" && ` (${selectedPriceRange})`}
            </span>
          )}
        </p>
        <Button onClick={() => {
          setShowReviewForm(true);
          setReviewStep('select-business');
          setSelectedBusiness(null);
        }}>
          Write a Review
        </Button>
      </div>

      {/* 비즈니스별 리뷰 매핑 */}
      <div className="space-y-4">
        {businessReviewPairs.length > 0 ? (
          businessReviewPairs.map(({ business, reviews: businessReviews }) => (
            <Card key={business.id} className="w-full overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start">
                {/* 좌측: 비즈니스 정보 */}
                <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center md:items-start">
                  {/* 비즈니스 사진 - 카드 상단에 여백 없이 */}
                  <div className="w-full -mt-6 -mx-6 mb-0 md:-mt-6 md:-mb-2 md:mx-0">
                    <img
                      src={business.image}
                      alt={business.name ?? ""}
                      className="w-full h-32 object-cover rounded-t-lg md:rounded-none md:rounded-tl-lg"
                    />
                  </div>
                  {/* 비즈니스 정보 */}
                  <div className="space-y-1 w-full px-6 py-4 md:px-4 md:pt-6 md:pb-4">
                    <h3 className="font-semibold text-lg text-gray-900">{business.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span>{business.type}</span>
                      <span>•</span>
                      <span>{business.location}</span>
                      <span>•</span>
                      <span>{business.price_range}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(business.average_rating ?? 0)}
                      <span className="text-xs text-gray-500">
                        {business.average_rating} ({business.total_reviews} reviews)
                      </span>
                    </div>
                    {Array.isArray(business.tags) &&
                      business.tags
                        .filter((tag: any) => typeof tag === "string")
                        .map((tag: any, idx: any) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{tag as string}</span>
                        ))
                    }
                  </div>
                </div>
                {/* 우측: 해당 비즈니스의 모든 리뷰 */}
                <CardContent className="flex-1 flex flex-col p-4 md:-mt-5 md:-mb-5 md:ml-4 min-h-32">
                  {businessReviews.length > 0 ? (
                    <div className="relative">
                      <ScrollArea className="max-h-64 min-h-0 pr-3 [&>[data-radix-scroll-area-viewport]]:max-h-64 [&>[data-radix-scroll-area-scrollbar]]:w-2">
                        <div className="flex flex-col gap-3 w-full">
                          {businessReviews.map((review) => (
                            <div key={`${review.business_id}-${review.author_username}-${review.created_at}`} className="border-b last:border-b-0 pb-3 last:pb-0 shadow-sm">
                              <div className="flex items-start gap-2">
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarImage src={review.author_avatar ?? ""} alt={review.author_username ?? ""} />
                                  <AvatarFallback className="text-xs">{(review.author_username ?? "").split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="font-medium text-sm text-gray-900 truncate">{review.author_username}</span>
                                      <div className="flex items-center ml-1">
                                        {renderStars(review.rating ?? 0)}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <span className="hidden sm:inline text-gray-400">•</span>
                                      <span className="truncate">{new Date(review.created_at ?? "").toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-700 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{review.content}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {/* 스크롤 인디케이터 - 리뷰가 많을 때만 표시 */}
                      {businessReviews.length > 2 && (
                        <div className="absolute bottom-0 left-0 right-3 h-6 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-1">
                          <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            ↓ Scroll for more reviews
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center text-sm py-8">No reviews yet for this business.</div>
                  )}
                </CardContent>
              </div>
            </Card>
          ))
        ) : (
          <Card className="w-full">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                {searchQuery || selectedType !== "All" || selectedPriceRange !== "All" 
                  ? `No businesses found matching your search criteria.` 
                  : "No businesses found yet."
                }
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchQuery || selectedType !== "All" || selectedPriceRange !== "All"
                  ? "Try adjusting your search or filters."
                  : "Be the first to add a business and write a review!"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Write a Review Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reviewStep === 'write-review' && selectedBusiness
                ? `Write a Review for ${selectedBusiness.name}`
                : 'Write a Review'}
            </DialogTitle>
          </DialogHeader>
          {reviewStep === 'select-business' && (
            <Tabs value={businessTab} onValueChange={setBusinessTab as any} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="existing">Existing Businesses</TabsTrigger>
                <TabsTrigger value="add">Add New Business</TabsTrigger>
              </TabsList>
              <TabsContent value="existing">
                {/* 기존 비즈니스 리스트/검색 UI */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Choose an existing business to write a review.
                  </div>
                  {/* Search Input */}
                  <div className="mb-3">
                    <Input
                      placeholder="Search businesses by name, type, or location..."
                      value={businessSearchQuery}
                      onChange={(e) => setBusinessSearchQuery(e.target.value)}
                      className="w-full border-slate-300 focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredBusinessesForSelection.length > 0 ? (
                      filteredBusinessesForSelection.map((business) => {
                        const hasReviewed = hasUserReviewedBusiness(business.id);
                        return (
                          <div
                            key={business.id}
                            className={`p-3 border rounded-lg transition-colors ${
                              hasReviewed
                                ? 'bg-green-50 border-green-200 cursor-not-allowed'
                                : 'bg-white border-blue-200 cursor-pointer hover:bg-blue-100'
                            }`}
                            onClick={() => {
                              if (!hasReviewed) {
                                setSelectedBusiness(business);
                                setReviewStep('write-review');
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{business.name}</h4>
                                  {hasReviewed && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Reviewed
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{business.type} • {business.location}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{business.price_range}</span>
                                <div className="flex items-center">
                                  {renderStars(business.average_rating ?? 0)}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="ml-2"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleEditBusiness(business);
                                    setBusinessTab('add');
                                  }}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500 bg-white border border-blue-200 rounded-lg">
                        <p className="mb-2">No businesses found matching "{businessSearchQuery}"</p>
                        <p className="text-sm">Try adding a new business in the next tab.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="add">
                {/* 새 비즈니스 입력 폼 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {/* 이미지 업로드 */}
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">Business Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files && e.target.files[0];
                        setNewBusinessImage(file || null);
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setNewBusinessImagePreview(url);
                        } else {
                          setNewBusinessImagePreview(null);
                        }
                      }}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {newBusinessImagePreview && (
                      <div className="mt-2">
                        <img
                          src={newBusinessImagePreview}
                          alt="Business Preview"
                          className="w-full max-h-40 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Business Name *</label>
                      <Input
                        placeholder="Enter business name..."
                        value={newBusiness.name}
                        onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                        className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                      />
                    </div>
                    {/* Business Type */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Business Type</label>
                      <div className="flex flex-wrap gap-2">
                        {[...(validBusinessTypes as unknown as string[])].filter(type => type !== "All").map(type => (
                          <Button
                            key={type}
                            variant={newBusiness.type === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewBusiness({ ...newBusiness, type: type as z.infer<typeof BusinessTypeSchema> })}
                            className={newBusiness.type === type ? "bg-slate-300  text-slate-800 hover:bg-slate-300" : "border-slate-300 text-slate-600 hover:bg-slate-50"}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Address *</label>
                      <Input
                        placeholder="Enter business address..."
                        value={newBusiness.address}
                        onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })}
                        className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                      />
                    </div>
                    {/* City Select */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">City *</label>
                      <Select
                        value={newBusiness.city || ''}
                        onValueChange={city => setNewBusiness({ ...newBusiness, city })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATIONS.map((city: string) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Price Range</label>
                      <div className="flex gap-2">
                        {validPriceRanges.filter(range => range !== "All").map((range) => (
                          <Button
                            key={range}
                            variant={newBusiness.priceRange === range ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewBusiness({ ...newBusiness, priceRange: range })}
                            className={newBusiness.priceRange === range ? "bg-slate-300  text-slate-800 hover:bg-slate-300" : "border-slate-300 text-slate-600 hover:bg-slate-50"}
                          >
                            {range}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {/* Continue 버튼 */}
                    {isEditingBusiness ? (
                      <Button
                        className="w-full mt-2"
                        onClick={handleSaveEditBusiness}
                        disabled={!newBusiness.name.trim() || !newBusiness.address.trim() || addUploading}
                      >
                        {addUploading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full mt-2"
                        onClick={handleAddBusinessContinue}
                        disabled={!newBusiness.name.trim() || !newBusiness.address.trim() || addUploading}
                      >
                        {addUploading ? 'Uploading...' : 'Continue'}
                      </Button>
                    )}
                    {addError && (
                      <div className="text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2 mt-2 text-center">
                        {addError}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          {/* 리뷰 작성 폼 */}
          {reviewStep === 'write-review' && selectedBusiness && (
            <Form method="post" id="review-form" className="space-y-4">
              <input type="hidden" name="businessId" value={selectedBusiness?.id} />
              {/* Error/Success Display */}
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {actionData.error}
                </div>
              )}
              {actionData && !('error' in actionData) && actionData.data && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  Review submitted successfully! The page will reload shortly.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= newReview.rating ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{newReview.rating}/5</span>
                </div>
                <input type="hidden" name="rating" value={newReview.rating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                  name="content"
                  className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Share your experience..."
                  value={newReview.review}
                  onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  {validPriceRanges.filter(range => range !== "All").map((range) => (
                    <Button
                      key={range}
                      variant={newReview.priceRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewReview({ ...newReview, priceRange: range })}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
                <input type="hidden" name="tags" value={JSON.stringify([newReview.priceRange])} />
              </div>
            </Form>
          )}
          <DialogFooter className="flex gap-2 pt-4">
            {reviewStep === 'write-review' && (
              <Button
                variant="outline"
                onClick={() => {
                  setReviewStep('select-business');
                  setSelectedBusiness(null);
                }}
              >
                Back
              </Button>
            )}
            {reviewStep === 'write-review' ? (
              <Button
                type="submit"
                form="review-form"
                className="flex-1"
                disabled={!newReview.review.trim()}
              >
                Submit Review
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedBusiness(null);
                  setReviewStep('select-business');
                  setBusinessTab('existing');
                  setBusinessSearchQuery("");
                  setNewReview({ rating: 5, review: "", priceRange: "$" as z.infer<typeof PriceRangeSchema>, tags: [] });
                  setNewBusiness({
                    name: "",
                    type: "Restaurant" as z.infer<typeof BusinessTypeSchema>,
                    location: urlLocation as z.infer<typeof LocationSchema>,
                    priceRange: "$" as z.infer<typeof PriceRangeSchema>,
                    tags: [],
                    address: "",
                    phone: "",
                    website: "",
                    description: "",
                    city: ""
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 