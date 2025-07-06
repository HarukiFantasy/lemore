import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import type { Route } from './+types/give-and-glow-page';
import { validateWithZod, getFieldErrors, getCategoryColors } from "~/lib/utils";
import { GiveAndGlowCard } from '../components/give-and-glow-card';

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

// Mock data types
interface MockReview {
  id: string;
  item_name: string;
  item_category: string;
  giver_name: string;
  giver_avatar?: string;
  receiver_name: string;
  receiver_avatar?: string;
  rating: number;
  review: string;
  timestamp: string;
  location: string;
  tags: string[];
  appreciation_badge: string;
}

export default function GiveAndGlowPage() {
  const [searchParams] = useSearchParams();
  const location = "Bangkok";
  const urlLocation = searchParams.get("location") || location;
  
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  // Mock data
  const mockReviews: MockReview[] = [
    {
      id: "1",
      item_name: "Vintage Coffee Table",
      item_category: "Furniture",
      giver_name: "Sarah Johnson",
      giver_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      receiver_name: "Mike Chen",
      receiver_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      review: "Absolutely love this coffee table! Sarah was so kind and the table is in perfect condition. It fits perfectly in my living room. The vintage style adds such character to my space. Thank you so much!",
      timestamp: "2024-01-15T10:30:00Z",
      location: "Bangkok",
      tags: ["excellent condition", "friendly giver", "smooth pickup"],
      appreciation_badge: "Heart of Gold"
    },
    {
      id: "2",
      item_name: "Bookshelf",
      item_category: "Furniture",
      giver_name: "David Kim",
      giver_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      receiver_name: "Emma Wilson",
      receiver_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4,
      review: "Great bookshelf! David was very helpful with the pickup. The shelf is sturdy and holds all my books perfectly. Minor scratches but nothing major. Very grateful for this generous gift!",
      timestamp: "2024-01-14T14:20:00Z",
      location: "Bangkok",
      tags: ["sturdy", "helpful giver", "minor wear"],
      appreciation_badge: "Community Hero"
    },
    {
      id: "3",
      item_name: "Kitchen Appliances Set",
      item_category: "Kitchen",
      giver_name: "Lisa Park",
      giver_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      receiver_name: "Tom Anderson",
      receiver_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      review: "Amazing kitchen set! Lisa was incredibly generous. Everything works perfectly and looks almost new. This has made cooking so much easier. The blender and toaster are my favorites!",
      timestamp: "2024-01-13T09:15:00Z",
      location: "Bangkok",
      tags: ["like new", "generous giver", "fully functional"],
      appreciation_badge: "Generosity Champion"
    },
    {
      id: "4",
      item_name: "Garden Tools",
      item_category: "Garden",
      giver_name: "Robert Martinez",
      giver_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      receiver_name: "Anna Lee",
      receiver_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      rating: 4,
      review: "Perfect timing! I was just starting my garden and these tools are exactly what I needed. Robert was very patient and showed me how to use each tool properly. Great quality!",
      timestamp: "2024-01-12T16:45:00Z",
      location: "Bangkok",
      tags: ["perfect timing", "patient giver", "good quality"],
      appreciation_badge: "Green Thumb"
    },
    {
      id: "5",
      item_name: "Children's Toys",
      item_category: "Toys",
      giver_name: "Maria Garcia",
      giver_avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      receiver_name: "James Brown",
      receiver_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      review: "My kids are overjoyed! Maria was so thoughtful and included a variety of toys for different ages. Everything is clean and in great condition. The kids haven't stopped playing!",
      timestamp: "2024-01-11T11:30:00Z",
      location: "Bangkok",
      tags: ["clean", "thoughtful", "kids love it"],
      appreciation_badge: "Child's Joy"
    }
  ];

  const validCategories = ["All", "Furniture", "Kitchen", "Garden", "Toys", "Electronics", "Clothing", "Books", "Sports", "Other"];

  // Filter reviews based on search and category
  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = searchQuery === "" || 
      review.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.giver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.review.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || review.item_category === selectedCategory;
    const matchesLocation = urlLocation === "All Cities" || review.location === urlLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
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