import React, { useState } from "react";
import { useSearchParams, Form, useActionData } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/common/components/ui/dialog";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import type { Route } from './+types/give-and-glow-page';
import { getCategoryColors } from "~/lib/utils";
import { GiveAndGlowCard } from '../components/give-and-glow-card';
import { getGiveAndGlowReviews } from '../queries';
import { PRODUCT_CATEGORIES } from '~/features/products/constants';
import { makeSSRClient } from "~/supa-client";
import { getUserStats, searchUsers } from '~/features/users/queries';
import { createGiveAndGlowReview } from '../mutation';
import { z } from "zod";

export const formSchema = z.object({
  itemName: z.string().min(1, { message: "Item name is required" }),
  itemCategory: z.string().min(1, { message: "Item category is required" }),
  giverId: z.string().min(1, { message: "Giver is required" }),
  rating: z.coerce.number().min(1).max(5),
  review: z.string().min(10, { message: "Review must be at least 10 characters" }),
});

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
  const url = new URL(request.url);
  const location = url.searchParams.get("location");
  
  const reviews = await getGiveAndGlowReviews(client);
  
  // Location filtering
  let filteredReviews = reviews;
  if (location && location !== "All Locations" && location !== "Other Cities") {
    filteredReviews = reviews.filter(review => review.product_location === location);
  }
  
  // Get all users for the dropdown
  const { data: users, error: usersError } = await client
    .from("users_view")
    .select("profile_id, username, avatar_url")
    .order("username", { ascending: true });
    
  if (usersError) {
    console.error("Error fetching users:", usersError);
  }
  
  // 각 리뷰의 giver와 receiver에 대한 통계 수집
  const userStatsMap = new Map();
  
  for (const review of filteredReviews) {
    // giver 통계
    if (review.giver_username && !userStatsMap.has(review.giver_username)) {
      try {
        const giverStats = await getUserStats(client, { username: review.giver_username });
        userStatsMap.set(review.giver_username, giverStats);
      } catch (error) {
        console.error(`Error fetching stats for giver ${review.giver_username}:`, error);
        userStatsMap.set(review.giver_username, {
          totalListings: 0,
          rating: 0,
          responseRate: "0%"
        });
      }
    }
    
    // receiver 통계
    if (review.receiver_username && !userStatsMap.has(review.receiver_username)) {
      try {
        const receiverStats = await getUserStats(client, { username: review.receiver_username });
        userStatsMap.set(review.receiver_username, receiverStats);
      } catch (error) {
        console.error(`Error fetching stats for receiver ${review.receiver_username}:`, error);
        userStatsMap.set(review.receiver_username, {
          totalListings: 0,
          rating: 0,
          responseRate: "0%"
        });
      }
    }
  }
  
  return { reviews: filteredReviews, userStats: Object.fromEntries(userStatsMap), users: users || [], location };
}

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  const formData = await request.formData();
  
  console.log("Form data received:", Object.fromEntries(formData));
  
  const { success, data, error } = formSchema.safeParse(Object.fromEntries(formData));
  if (!success) {
    console.log("Validation errors:", error.flatten().fieldErrors);
    return { fieldErrors: error.flatten().fieldErrors };
  }
  const { itemName, itemCategory, giverId, rating, review } = data;
  
  console.log("Validated data:", { itemName, itemCategory, giverId, rating, review });
  
  try {
    await createGiveAndGlowReview(client, {
      itemName,
      itemCategory,
      giverId,
      rating,
      review,
    });
    console.log("Review created successfully");
    return { success: true };
  } catch (error) {
    console.error("Error creating review:", error);
    return { 
      error: "Failed to submit review. Please try again." 
    };
  }
}

export default function GiveAndGlowPage({ loaderData }: Route.ComponentProps) {
  const { reviews, userStats, users, location } = loaderData;
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location");
  const currentLocation = urlLocation || "Bangkok";
  const urlSearchQuery = searchParams.get("search") || "";
  const urlCategoryFilter = searchParams.get("category") || "All";
  
  // State variables
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(urlCategoryFilter);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    itemName: "",
    itemCategory: "Furniture",
    giverId: "",
    giverName: "", // For display purposes
    rating: 5,
    review: "",
    location: urlLocation,
    tags: [] as string[]
  });
  
  // User selection state
  const [selectedGiver, setSelectedGiver] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter reviews based on search and category
  const filteredReviews = reviews
    .filter((review: any) => {
      const matchesSearch = !urlSearchQuery || 
        review.product_title?.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
        review.giver_username?.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
        review.receiver_username?.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
        review.review?.toLowerCase().includes(urlSearchQuery.toLowerCase());
      
      const matchesCategory = urlCategoryFilter === "All" || review.category === urlCategoryFilter;
      const matchesLocation = !urlLocation || urlLocation === "Other Cities" || review.product_location === urlLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a: any, b: any) => {
      // Sort by created_at in descending order (newest first)
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
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

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
  };

  // Clear specific filter
  const handleClearFilter = (filterType: 'search' | 'category') => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filterType === 'search') {
      newSearchParams.delete("search");
      setSearchQuery("");
    } else if (filterType === 'category') {
      newSearchParams.delete("category");
      setSelectedCategory("All");
    }
    setSearchParams(newSearchParams);
  };

  const handleUserSelect = (user: any) => {
    setSelectedGiver(user);
    setNewReview({
      ...newReview,
      giverId: user.profile_id,
      giverName: user.username
    });
    setSearchTerm(user.username || "");
    setShowDropdown(false);
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close modal when action is successful
  React.useEffect(() => {
    if (actionData && !('fieldErrors' in actionData) && !('error' in actionData)) {
      console.log("Action successful, closing modal");
      setShowReviewForm(false);
      setNewReview({
        itemName: "",
        itemCategory: "Furniture",
        giverId: "",
        giverName: "",
        rating: 5,
        review: "",
        location: urlLocation as any,
        tags: []
      });
      setSearchTerm("");
      setSelectedGiver(null);
      setShowDropdown(false);
      
      // Reload the page to show the new review
      window.location.reload();
    }
  }, [actionData]);
  
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
          Share appreciation for free items received and spread kindness {!urlLocation ? "across all locations" : `in ${currentLocation}`}</p>
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

      {/* Active filters display and clear */}
      {(urlSearchQuery || urlCategoryFilter !== "All") && (
        <div className="mb-6 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {urlSearchQuery && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              <span>Search: "{urlSearchQuery}"</span>
              <button
                onClick={() => handleClearFilter('search')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </div>
          )}
          {urlCategoryFilter !== "All" && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <span>Category: {urlCategoryFilter}</span>
              <button
                onClick={() => handleClearFilter('category')}
                className="ml-1 text-blue-600 hover:text-blue-800"
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
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold text-blue-600">{filteredReviews.length}</span> reviews
          {!urlLocation ? " across all locations" : urlLocation === "Other Cities" ? " across all cities" : ` in ${currentLocation}`}
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
            itemName={review.product_title || "Unknown Item"}
            itemCategory={review.category}
            giverName={review.giver_username || "Unknown Giver"}
            giverAvatar={review.giver_avatar_url}
            receiverName={review.receiver_username || "Unknown Receiver"}
            receiverAvatar={review.receiver_avatar_url}
            giverId={review.giver_profile_id}
            receiverId={review.receiver_profile_id}
            rating={review.rating}
            review={review.review}
            timestamp={review.created_at}
            location={review.product_location || "Unknown Location"}
            tags={review.tags || []}
            appreciationBadge={review.rating > 4}
            giverStats={userStats[review.giver_username]}
            receiverStats={userStats[review.receiver_username]}
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
              className="mt-4 cursor-pointer"
              size="lg"
            >
              Write a Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Write a Review for Free Item Received</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Form method="post" className="space-y-4 pr-4">
              {/* Error/Success Display */}
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {actionData.error}
                </div>
              )}
              
              {actionData && !('fieldErrors' in actionData) && !('error' in actionData) && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  Review submitted successfully! The page will reload shortly.
                </div>
              )}

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <Input
                  placeholder="What item did you receive?"
                  name="itemName"
                  defaultValue={newReview.itemName}
                  className={actionData?.fieldErrors?.itemName ? "border-red-500" : ""}
                />
                {actionData?.fieldErrors?.itemName && (
                  <p className="text-red-500 text-sm mt-1">{actionData.fieldErrors.itemName[0]}</p>
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
                {actionData?.fieldErrors?.itemCategory && (
                  <p className="text-red-500 text-sm mt-1">{actionData.fieldErrors.itemCategory[0]}</p>
                )}
                <input type="hidden" name="itemCategory" value={newReview.itemCategory} />
              </div>

              {/* Giver Selection */}
              <div className="relative user-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Giver *</label>
                <Input
                  placeholder="Search for a user..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className={actionData?.fieldErrors?.giverId ? "border-red-500" : ""}
                />
                <input type="hidden" name="giverId" value={newReview.giverId || ""} />
                {actionData?.fieldErrors?.giverId && (
                  <p className="text-red-500 text-sm mt-1">{actionData.fieldErrors.giverId[0]}</p>
                )}
                
                {/* Search Results Dropdown */}
                {showDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.profile_id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                      >
                        {user.avatar_url && (
                          <img 
                            src={user.avatar_url} 
                            alt={user.username || ""}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">{user.username}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No results message */}
                {showDropdown && searchTerm && filteredUsers.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
                    No users found matching "{searchTerm}"
                  </div>
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
                <input type="hidden" name="rating" value={newReview.rating} />
                {actionData?.fieldErrors?.rating && (
                  <p className="text-red-500 text-sm mt-1">{actionData.fieldErrors.rating[0]}</p>
                )}
              </div>
              
              {/* Review */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
                <textarea
                  className={`w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring ${actionData?.fieldErrors?.review ? "border-red-500" : ""}`}
                  placeholder="Share your experience and appreciation for the free item you received..."
                  name="review"
                  defaultValue={newReview.review}
                />
                {actionData?.fieldErrors?.review && (
                  <p className="text-red-500 text-sm mt-1">{actionData.fieldErrors.review[0]}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
                <Input
                  placeholder="excellent condition, friendly giver, smooth pickup (comma separated)"
                  defaultValue={newReview.tags.join(", ")}
                />
              </div>

              <DialogFooter className="flex gap-2 pt-4">
                <Button 
                  type="submit"
                  className="flex-1 cursor-pointer"
                >
                  Submit Review
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setShowReviewForm(false);
                    setNewReview({
                      itemName: "",
                      itemCategory: "Furniture",
                      giverId: "",
                      giverName: "",
                      rating: 5,
                      review: "",
                      location: urlLocation as any,
                      tags: []
                    });
                    setSearchTerm("");
                    setSelectedGiver(null);
                    setShowDropdown(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
} 