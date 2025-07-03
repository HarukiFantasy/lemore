import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import type { Route } from './+types/give-and-glow-page';
import { z } from "zod";
import { 
  type GiveAndGlowReview, 
  VALID_GIVE_AND_GLOW_CATEGORIES,
  VALID_GIVE_AND_GLOW_LOCATIONS
} from "../schema";
import { validateWithZod, getFieldErrors, getCategoryColors } from "~/lib/utils";
import { GiveAndGlowCard } from '../components/give-and-glow-card';

// Zod Schemas for Give & Glow
export const giveAndGlowFiltersSchema = z.object({
  category: z.enum(VALID_GIVE_AND_GLOW_CATEGORIES as unknown as [string, ...string[]]).default("All"),
  location: z.enum(VALID_GIVE_AND_GLOW_LOCATIONS as unknown as [string, ...string[]]).default("Bangkok"),
  search: z.string().optional().default(""),
});

export const createGiveAndGlowReviewSchema = z.object({
  itemName: z.string().min(1, "Item name is required").max(100, "Item name must be less than 100 characters"),
  itemCategory: z.enum(VALID_GIVE_AND_GLOW_CATEGORIES.filter(cat => cat !== "All") as unknown as [string, ...string[]]),
  giverName: z.string().min(1, "Giver name is required").max(100, "Giver name must be less than 100 characters"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  review: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review must be less than 2000 characters"),
  location: z.enum(VALID_GIVE_AND_GLOW_LOCATIONS.filter(loc => loc !== "All Cities") as unknown as [string, ...string[]]),
  tags: z.array(z.string()).optional().default([]),
});

// Type definitions
export type GiveAndGlowFilters = z.infer<typeof giveAndGlowFiltersSchema>;
export type CreateGiveAndGlowReviewData = z.infer<typeof createGiveAndGlowReviewSchema>;

// Loader function
export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const rawFilters = {
      category: url.searchParams.get("category") || "All",
      location: url.searchParams.get("location") || "Bangkok",
      search: url.searchParams.get("search") || "",
    };

    // Zod를 사용한 데이터 검증
    const validationResult = validateWithZod(giveAndGlowFiltersSchema, rawFilters);
    
    if (!validationResult.success) {
      throw new Response(`Validation error: ${validationResult.errors.join(", ")}`, { 
        status: 400 
      });
    }

    const validatedFilters = validationResult.data;

    // 하드코딩된 목업 데이터
    const mockReviews: GiveAndGlowReview[] = [
      {
        id: "1",
        item_name: "Vintage Bookshelf",
        item_category: "Furniture",
        giver_name: "Sarah Johnson",
        giver_avatar: "/sample.png",
        receiver_name: "Mike Chen",
        receiver_avatar: "/sample.png",
        rating: 5,
        review: "Amazing bookshelf! Sarah was so kind to give it away for free. The quality is excellent and it fits perfectly in my study room.",
        timestamp: "2 hours ago",
        location: "Bangkok",
        tags: ["Excellent Condition", "Friendly Giver", "Smooth Pickup"],
        photos: [],
        appreciation_badge: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: "2",
        item_name: "Kitchen Appliances Set",
        item_category: "Kitchen",
        giver_name: "Emma Wilson",
        giver_avatar: "/sample.png",
        receiver_name: "David Kim",
        receiver_avatar: "/sample.png",
        rating: 4,
        review: "Great set of kitchen appliances! Emma was very generous to give away her barely used mixer, blender, and toaster.",
        timestamp: "1 day ago",
        location: "ChiangMai",
        tags: ["Good Condition", "Multiple Items", "Quick Handover"],
        photos: [],
        appreciation_badge: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: "3",
        item_name: "Children's Toys",
        item_category: "Toys",
        giver_name: "Lisa Park",
        giver_avatar: "/sample.png",
        receiver_name: "Anna Rodriguez",
        receiver_avatar: "/sample.png",
        rating: 5,
        review: "Wonderful collection of children's toys! Lisa was incredibly thoughtful and organized everything so well.",
        timestamp: "3 days ago",
        location: "Phuket",
        tags: ["Clean Items", "Well Organized", "Kids Love It"],
        photos: [],
        appreciation_badge: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return {
      reviews: mockReviews,
      filters: validatedFilters,
      totalCount: mockReviews.length,
      validCategories: VALID_GIVE_AND_GLOW_CATEGORIES,
      validLocations: VALID_GIVE_AND_GLOW_LOCATIONS
    };

  } catch (error) {
    console.error("Loader error:", error);
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response("Internal server error", { status: 500 });
  }
};

// Error Boundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading give-and-glow reviews.";

  if (error instanceof Response) {
    if (error.status === 400) {
      message = "Invalid Request";
      details = error.statusText || "The request contains invalid parameters.";
    } else if (error.status === 500) {
      message = "Server Error";
      details = "An internal server error occurred. Please try again later.";
    }
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{message}</h1>
            <p className="text-gray-600 mb-6">{details}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GiveAndGlowPage({ loaderData }: Route.ComponentProps) {
  const { reviews: initialReviews, filters, totalCount, validCategories, validLocations } = loaderData;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || filters.location;
  
  const [reviews, setReviews] = useState<GiveAndGlowReview[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [selectedCategory, setSelectedCategory] = useState<GiveAndGlowFilters['category']>(filters.category || "All");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState<CreateGiveAndGlowReviewData>({
    itemName: "",
    itemCategory: "Furniture",
    giverName: "",
    rating: 5,
    review: "",
    location: urlLocation as any,
    tags: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL 파라미터와 상태 동기화
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const category = VALID_GIVE_AND_GLOW_CATEGORIES.includes(categoryParam as any) 
      ? (categoryParam as GiveAndGlowFilters['category']) 
      : "All";
    const search = searchParams.get("search") || "";
    
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [searchParams]);

  // Update filters and URL
  const updateFilters = (newCategory: GiveAndGlowFilters['category'], newSearch: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (newCategory && newCategory !== "All") {
      newSearchParams.set("category", newCategory);
    } else {
      newSearchParams.delete("category");
    }
    
    if (newSearch) {
      newSearchParams.set("search", newSearch);
    } else {
      newSearchParams.delete("search");
    }
    
    setSearchParams(newSearchParams);
  };

  const handleCategoryChange = (category: GiveAndGlowFilters['category']) => {
    setSelectedCategory(category);
    updateFilters(category, searchQuery);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    updateFilters(selectedCategory, search);
  };

  // Filter reviews based on search and filters
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.giver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.review.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || review.item_category === selectedCategory;
    const matchesLocation = urlLocation === "All Cities" || review.location === urlLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const validateForm = (): boolean => {
    const result = createGiveAndGlowReviewSchema.safeParse(newReview);
    
    if (!result.success) {
      const errors = getFieldErrors(createGiveAndGlowReviewSchema, newReview);
      setFormErrors(errors);
      return false;
    }

    // Validate tags separately
    if (newReview.tags && newReview.tags.length > 0) {
      if (newReview.tags.length > 10) {
        setFormErrors({ ...formErrors, tags: "Maximum 10 tags allowed" });
        return false;
      }
      for (const tag of newReview.tags) {
        if (tag.length > 20) {
          setFormErrors({ ...formErrors, tags: "Each tag must be less than 20 characters" });
          return false;
        }
      }
    }
    
    setFormErrors({});
    return true;
  };

  const handleSubmitReview = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try { 
      const reviewData = {
        item_name: newReview.itemName,
        item_category: newReview.itemCategory,
        giver_name: newReview.giverName,
        giver_avatar: "/sample.png", // In real app, this would be the giver's avatar
        receiver_name: "Current User", // In real app, this would be the logged-in user
        receiver_avatar: "/sample.png", // In real app, this would be the user's avatar
        rating: newReview.rating,
        review: newReview.review,
        location: newReview.location,
        tags: newReview.tags,
        photos: [], // In real app, this would be uploaded photos
        appreciation_badge: true, // New reviews get appreciation badge
        created_at: new Date(),
        updated_at: new Date()
      };

      // 하드코딩된 새 리뷰 생성
      const newReviewData: GiveAndGlowReview = {
        id: Date.now().toString(),
        ...reviewData,
        timestamp: "Just now"
      };
      setReviews([newReviewData, ...reviews]);
      setShowReviewForm(false);
      setNewReview({
        itemName: "",
        itemCategory: "Furniture",
        giverName: "",
        rating: 5,
        review: "",
        location: urlLocation as any,
        tags: []
      });
      setFormErrors({});
    } catch (error) {
      console.error("Error submitting review:", error);
      setFormErrors({ submit: error instanceof Error ? error.message : "Failed to submit review" });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-0 py-6 md:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Give and Glow</h1>
        <p className="text-muted-foreground pb-6">
          Share appreciation for free items received and spread kindness in our community
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Reviews</label>
            <Input
              type="text"
              placeholder="Search by item name, giver name, or review content..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
            <div className="flex flex-wrap gap-2">
              {validCategories.map((category) => {
                const colors = getCategoryColors(category);
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                    className={selectedCategory === category ? `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}` : ""}
                  >
                    {category}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Statistics and Action Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold text-blue-600">{filteredReviews.length}</span> reviews
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
        <Button onClick={() => setShowReviewForm(true)} size="lg">
          Write a Review
        </Button>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        {filteredReviews.map((review) => (
          <GiveAndGlowCard 
            key={review.id}
            id={review.id}
            itemName={review.item_name}
            itemCategory={review.item_category}
            giverName={review.giver_name}
            giverAvatar={review.giver_avatar || undefined}
            receiverName={review.receiver_name}
            receiverAvatar={review.receiver_avatar || undefined}
            rating={review.rating}
            review={review.review}
            timestamp={review.timestamp}
            location={review.location}
            tags={review.tags as string[]}
            appreciationBadge={review.appreciation_badge}
          />
        ))}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Write a Review for Free Item Received</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Display */}
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {formErrors.submit}
                </div>
              )}

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <Input
                  placeholder="What item did you receive?"
                  value={newReview.itemName}
                  onChange={(e) => setNewReview({ ...newReview, itemName: e.target.value })}
                  className={formErrors.itemName ? "border-red-500" : ""}
                />
                {formErrors.itemName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.itemName}</p>
                )}
              </div>

              {/* Item Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
                <div className="flex flex-wrap gap-2">
                  {validCategories.filter(cat => cat !== "All").map((category) => {
                    const colors = getCategoryColors(category);
                    return (
                      <Button
                        key={category}
                        variant={newReview.itemCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewReview({ ...newReview, itemCategory: category })}
                        className={newReview.itemCategory === category ? `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}` : ""}
                      >
                        {category}
                      </Button>
                    );
                  })}
                </div>
                {formErrors.itemCategory && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.itemCategory}</p>
                )}
              </div>

              {/* Giver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giver's Name *</label>
                <Input
                  placeholder="Who gave you this item?"
                  value={newReview.giverName}
                  onChange={(e) => setNewReview({ ...newReview, giverName: e.target.value })}
                  className={formErrors.giverName ? "border-red-500" : ""}
                />
                {formErrors.giverName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.giverName}</p>
                )}
              </div>

              {/* Rating */}
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
                {formErrors.rating && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>
                )}
              </div>
              
              {/* Review */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
                <textarea
                  className={`w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.review ? "border-red-500" : ""}`}
                  placeholder="Share your experience and appreciation for the free item you received..."
                  value={newReview.review}
                  onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                />
                {formErrors.review && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.review}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
                <Input
                  placeholder="excellent condition, friendly giver, smooth pickup (comma separated)"
                  value={newReview.tags}
                  onChange={(e) => setNewReview({ ...newReview, tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag) })}
                  className={formErrors.tags ? "border-red-500" : ""}
                />
                {formErrors.tags && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.tags}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmitReview} 
                  className="flex-1"
                  disabled={isSubmitting || !newReview.itemName || !newReview.giverName || !newReview.review}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowReviewForm(false);
                    setNewReview({
                      itemName: "",
                      itemCategory: "Furniture",
                      giverName: "",
                      rating: 5,
                      review: "",
                      location: urlLocation as any,
                      tags: []
                    });
                    setFormErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 