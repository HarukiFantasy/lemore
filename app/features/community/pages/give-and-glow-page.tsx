import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Separator } from "~/common/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/common/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { Route } from './+types/give-and-glow-page';
import { 
  type GiveAndGlowReview, 
  type GiveAndGlowFilters,
  type CreateGiveAndGlowReviewData,
  giveAndGlowFiltersSchema,
  createGiveAndGlowReviewSchema,
  VALID_GIVE_AND_GLOW_CATEGORIES,
  VALID_GIVE_AND_GLOW_LOCATIONS
} from "~/lib/schemas";
import { validateWithZod, getFieldErrors } from "~/lib/utils";
import { fetchGiveAndGlowReviewsFromDatabase, createGiveAndGlowReview } from "~/features/community/queries";

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

    // 데이터베이스에서 리뷰 가져오기
    const reviews = await fetchGiveAndGlowReviewsFromDatabase({
      category: validatedFilters.category || "All",
      location: validatedFilters.location || "Bangkok", 
      search: validatedFilters.search || ""
    });

    return {
      reviews,
      filters: validatedFilters,
      totalCount: reviews.length,
      validCategories: VALID_GIVE_AND_GLOW_CATEGORIES,
      validLocations: VALID_GIVE_AND_GLOW_LOCATIONS
    };

  } catch (error) {
    console.error("Loader error:", error);
    
    if (error instanceof Response) {
      // 이미 Response 객체인 경우 그대로 던지기
      throw error;
    }
    
    if (error instanceof Error) {
      // 데이터베이스 에러인 경우 500 Internal Server Error 반환
      if (error.message.includes("Failed to fetch give-and-glow reviews from database")) {
        throw new Response("Database connection failed", { status: 500 });
      }
    }
    
    // 기타 에러는 500 Internal Server Error 반환
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
    tags: ""
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
    const matchesSearch = review.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.giverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || review.itemCategory === selectedCategory;
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
    if (newReview.tags) {
      const tags = newReview.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      if (tags.length > 10) {
        setFormErrors({ ...formErrors, tags: "Maximum 10 tags allowed" });
        return false;
      }
      for (const tag of tags) {
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
      const tags = newReview.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      
      const reviewData = {
        itemName: newReview.itemName,
        itemCategory: newReview.itemCategory,
        giverName: newReview.giverName,
        receiverName: "Current User", // In real app, this would be the logged-in user
        receiverAvatar: "/sample.png", // In real app, this would be the user's avatar
        rating: newReview.rating,
        review: newReview.review,
        location: newReview.location,
        tags,
        photos: [] // In real app, this would be uploaded photos
      };

      const newReviewData = await createGiveAndGlowReview(reviewData);
      setReviews([newReviewData, ...reviews]);
      setShowReviewForm(false);
      setNewReview({
        itemName: "",
        itemCategory: "Furniture",
        giverName: "",
        rating: 5,
        review: "",
        location: urlLocation as any,
        tags: ""
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Give and Glow</h1>
        <p className="text-gray-600">
          Share appreciation for free items received and spread kindness in our community
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Reviews</label>
            <Input
              placeholder="Search by item name, giver name, or review content..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
            <div className="flex flex-wrap gap-2">
              {validCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Button>
              ))}
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
          ✨ Write a Review
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Giver Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={review.giverAvatar} alt={review.giverName} />
                    <AvatarFallback>{review.giverName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    {/* Review Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{review.itemName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Given by {review.giverName}</span>
                          <span>•</span>
                          <span>{review.location}</span>
                          <span>•</span>
                          <span>{review.timestamp}</span>
                        </div>
                      </div>
                      {review.appreciationBadge && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          <span>✨</span>
                          <span>Appreciation Badge</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Rating and Category */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">{review.rating}/5</span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {review.itemCategory}
                      </span>
                    </div>
                    
                    {/* Review Content */}
                    <p className="text-gray-700 mb-4 leading-relaxed">{review.review}</p>
                    
                    {/* Tags */}
                    {review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {review.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Receiver Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Reviewed by {review.receiverName}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No reviews found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
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
                  {validCategories.filter(cat => cat !== "All").map((category) => (
                    <Button
                      key={category}
                      variant={newReview.itemCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewReview({ ...newReview, itemCategory: category })}
                    >
                      {category}
                    </Button>
                  ))}
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
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="text-2xl"
                    >
                      {renderStars(star)}
                    </button>
                  ))}
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
                  onChange={(e) => setNewReview({ ...newReview, tags: e.target.value })}
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
                      tags: ""
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