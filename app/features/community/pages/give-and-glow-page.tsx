import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import type { Route } from './+types/give-and-glow-page';
import { getCategoryColors } from "~/lib/utils";
import { GiveAndGlowCard } from '../components/give-and-glow-card';
import { getGiveAndGlowReviews } from '../queries';
import { PRODUCT_CATEGORIES } from '~/features/products/constants';
import { makeSSRClient } from "~/supa-client";

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

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const reviews = await getGiveAndGlowReviews(client);
  return { reviews };
}

export default function GiveAndGlowPage({ loaderData }: Route.ComponentProps) {
  const { reviews } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const location = "Bangkok";
  const urlLocation = searchParams.get("location") || location;
  const urlSearchQuery = searchParams.get("search") || "";
  const urlCategoryFilter = searchParams.get("category") || "All";
  
  // State variables
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(urlCategoryFilter);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newReview, setNewReview] = useState({
    itemName: "",
    itemCategory: "Furniture",
    giverName: "",
    rating: 5,
    review: "",
    location: urlLocation,
    tags: [] as string[]
  });


  // Filter reviews based on search and category
  const filteredReviews = reviews.filter((review: any) => {
    const matchesSearch = !urlSearchQuery || 
      review.product?.title?.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      review.giver?.username?.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      review.receiver?.username?.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      review.review?.toLowerCase().includes(urlSearchQuery.toLowerCase());
    
    const matchesCategory = urlCategoryFilter === "All" || review.category === urlCategoryFilter;
    const matchesLocation = urlLocation === "All Cities" || review.product?.location === urlLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newSearchParams.set("search", searchQuery.trim());
    } else {
      newSearchParams.delete("search");
    }
    setSearchParams(newSearchParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newSearchParams = new URLSearchParams(searchParams);
    if (category === "All") {
      newSearchParams.delete("category");
    } else {
      newSearchParams.set("category", category);
    }
    setSearchParams(newSearchParams);
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    // Simple validation
    const errors: Record<string, string> = {};
    if (!newReview.itemName.trim()) errors.itemName = "Item name is required";
    if (!newReview.giverName.trim()) errors.giverName = "Giver name is required";
    if (!newReview.review.trim()) errors.review = "Review is required";
    if (newReview.review.trim().length < 10) errors.review = "Review must be at least 10 characters";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
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
    setIsSubmitting(false);
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
          {location}
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Reviews</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search by item name, giver name, or review content..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}  
                />
                <Button type="submit" variant="outline" size="sm">
                  Search
                </Button>
              </div>
            </div>
          </form>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((category) => {
                const colors = getCategoryColors(category);
                const isActive = urlCategoryFilter === category;
                return (
                  <Button
                    key={category}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                    className={isActive ? `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}` : ""}
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
          {(urlSearchQuery || urlCategoryFilter !== "All") && (
            <span className="ml-2">
              {urlSearchQuery && ` for "${urlSearchQuery}"`}
              {urlCategoryFilter !== "All" && ` in ${urlCategoryFilter}`}
            </span>
          )}
        </p>
        <Button onClick={() => setShowReviewForm(true)} size="lg">
          Write a Review
        </Button>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        {filteredReviews.map((review: any) => (
          <GiveAndGlowCard 
            key={review.id}
            id={review.id.toString()}
            itemName={review.product?.title || "Unknown Item"}
            itemCategory={review.category}
            giverName={review.giver?.username || "Unknown Giver"}
            giverAvatar={review.giver?.avatar_url}
            receiverName={review.receiver?.username || "Unknown Receiver"}
            receiverAvatar={review.receiver?.avatar_url}
            giverId={review.giver?.profile_id}
            receiverId={review.receiver?.profile_id}
            rating={review.rating}
            review={review.review}
            timestamp={review.created_at}
            location={review.product?.location || "Unknown Location"}
            tags={review.tags || []}
            appreciationBadge={review.rating > 4}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {urlSearchQuery || urlCategoryFilter !== "All" 
                ? `No reviews found matching your search criteria.` 
                : "No reviews found. Be the first to write a review!"
              }
            </p>
            <Button 
              onClick={() => setShowReviewForm(true)} 
              className="mt-4"
              size="lg"
            >
              Write a Review
            </Button>
          </CardContent>
        </Card>
      )}

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
                  {PRODUCT_CATEGORIES.map((category) => {
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
                  value={newReview.tags.join(", ")}
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