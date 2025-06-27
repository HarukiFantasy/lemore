import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import type { Route } from './+types/local-reviews-page';
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";

// Types
interface Review {
  id: string;
  businessName: string;
  businessType: string;
  location: string;
  rating: number;
  review: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  photos?: string[];
  priceRange: string;
  tags: string[];
}

interface Business {
  id: string;
  name: string;
  type: string;
  location: string;
  averageRating: number;
  totalReviews: number;
  priceRange: string;
  tags: string[];
  image?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
}

// Constants
const BUSINESS_TYPES = ["Restaurant", "Cafe", "Shop", "Service", "Entertainment", "All"];
const PRICE_RANGES = ["$", "$$", "$$$", "$$$$", "All"];
const VALID_LOCATIONS = ["Bangkok", "ChiangMai", "HuaHin", "Phuket", "Pattaya", "Koh Phangan", "Koh Tao", "Koh Samui", "All Cities"];

// Database connection function (replace with actual database client)
async function fetchBusinessesFromDatabase(filters: {
  type: string;
  location: string;
  search: string;
  priceRange: string;
}): Promise<Business[]> {
  try {
    // TODO: Replace with actual database connection code
    // Example: const businesses = await db.businesses.findMany({ where: filters });
    
    // For now, return empty array (until database is connected)
    return [];
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch businesses from database");
  }
}

async function fetchReviewsFromDatabase(filters: {
  location: string;
  limit: number;
}): Promise<Review[]> {
  try {
    // TODO: Replace with actual database connection code
    // Example: const reviews = await db.reviews.findMany({ where: filters, take: limit });
    
    // For now, return empty array (until database is connected)
    return [];
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch reviews from database");
  }
}

// Validation functions
function validateBusinessType(type: string | undefined): string {
  if (!type || type === "All") {
    return "All";
  }
  
  if (!BUSINESS_TYPES.slice(0, -1).includes(type)) {
    throw new Error(`Invalid business type: ${type}. Valid types are: ${BUSINESS_TYPES.slice(0, -1).join(", ")}`);
  }
  
  return type;
}

function validateLocation(location: string | undefined): string {
  if (!location) {
    return "Bangkok"; // Default value
  }
  
  if (!VALID_LOCATIONS.includes(location)) {
    throw new Error(`Invalid location: ${location}. Valid locations are: ${VALID_LOCATIONS.join(", ")}`);
  }
  
  return location;
}

function validateSearchQuery(search: string | undefined): string {
  if (!search) {
    return "";
  }
  
  // Search query length limit
  if (search.length > 100) {
    throw new Error("Search query is too long. Maximum length is 100 characters.");
  }
  
  // Sanitize search query (XSS prevention)
  const sanitizedSearch = search.replace(/[<>]/g, "");
  
  return sanitizedSearch.trim();
}

function validatePriceRange(priceRange: string | undefined): string {
  if (!priceRange || priceRange === "All") {
    return "All";
  }
  
  if (!PRICE_RANGES.slice(0, -1).includes(priceRange)) {
    throw new Error(`Invalid price range: ${priceRange}. Valid ranges are: ${PRICE_RANGES.slice(0, -1).join(", ")}`);
  }
  
  return priceRange;
}

// Database filtering function
function buildDatabaseFilters(validatedType: string, validatedLocation: string, validatedSearch: string, validatedPriceRange: string) {
  const filters: any = {};
  
  if (validatedType !== "All") {
    filters.type = validatedType;
  }
  
  if (validatedLocation !== "All Cities") {
    filters.location = validatedLocation;
  }
  
  if (validatedSearch) {
    filters.search = validatedSearch;
  }
  
  if (validatedPriceRange !== "All") {
    filters.priceRange = validatedPriceRange;
  }
  
  return filters;
}

// Time formatting utility
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

// Loader function
export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || undefined;
    const location = url.searchParams.get("location") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const priceRange = url.searchParams.get("priceRange") || undefined;

    // Data validation
    const validatedType = validateBusinessType(type);
    const validatedLocation = validateLocation(location);
    const validatedSearch = validateSearchQuery(search);
    const validatedPriceRange = validatePriceRange(priceRange);

    // Fetch data from database
    const databaseFilters = buildDatabaseFilters(validatedType, validatedLocation, validatedSearch, validatedPriceRange);
    const businesses = await fetchBusinessesFromDatabase(databaseFilters);
    const reviews = await fetchReviewsFromDatabase({ location: validatedLocation, limit: 10 });

    // Transform data for client
    const transformedBusinesses = businesses.map(business => ({
      id: business.id,
      name: business.name,
      type: business.type,
      location: business.location,
      averageRating: business.averageRating,
      totalReviews: business.totalReviews,
      priceRange: business.priceRange,
      tags: business.tags,
      image: business.image,
      address: business.address,
      phone: business.phone,
      website: business.website,
      description: business.description
    }));

    const transformedReviews = reviews.map(review => ({
      id: review.id,
      businessName: review.businessName,
      businessType: review.businessType,
      location: review.location,
      rating: review.rating,
      review: review.review,
      author: review.author,
      authorAvatar: review.authorAvatar,
      timestamp: formatTimeAgo(new Date(review.timestamp)),
      photos: review.photos,
      priceRange: review.priceRange,
      tags: review.tags
    }));

    return {
      businesses: transformedBusinesses,
      reviews: transformedReviews,
      filters: {
        type: validatedType,
        location: validatedLocation,
        search: validatedSearch,
        priceRange: validatedPriceRange
      },
      totalCount: transformedBusinesses.length,
      validBusinessTypes: BUSINESS_TYPES,
      validPriceRanges: PRICE_RANGES
    };

  } catch (error) {
    console.error("Loader error:", error);
    
    if (error instanceof Error) {
      // Validation errors return 400 Bad Request
      if (error.message.includes("Invalid business type") || 
          error.message.includes("Invalid location") || 
          error.message.includes("Invalid price range") ||
          error.message.includes("Search query is too long")) {
        throw new Response(error.message, { status: 400 });
      }
      
      // Database errors return 500 Internal Server Error
      if (error.message.includes("Failed to fetch")) {
        throw new Response("Database connection failed", { status: 500 });
      }
    }
    
    // Other errors return 500 Internal Server Error
    throw new Response("Internal server error", { status: 500 });
  }
};

// Error Boundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading local reviews.";

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

// Main component
export default function LocalReviewsPage({ loaderData }: Route.ComponentProps) {
  const { businesses, reviews, filters, totalCount, validBusinessTypes, validPriceRanges } = loaderData;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || filters.location;
  
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [selectedType, setSelectedType] = useState(filters.type);
  const [selectedPriceRange, setSelectedPriceRange] = useState(filters.priceRange);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    review: "",
    priceRange: "$",
    tags: [] as string[]
  });
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    type: "Restaurant",
    location: urlLocation,
    priceRange: "$",
    tags: [] as string[],
    address: "",
    phone: "",
    website: "",
    description: ""
  });

  useEffect(() => {
    setNewBusiness(prev => ({ ...prev, location: urlLocation }));
  }, [urlLocation]);

  // Filter businesses based on current state
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          business.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "All" || business.type === selectedType;
    const matchesLocation = urlLocation === "All Cities" || business.location === urlLocation;
    const matchesPrice = selectedPriceRange === "All" || business.priceRange === selectedPriceRange;
    
    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });

  // Update filters and URL
  const updateFilters = (newType: string, newSearch: string, newPriceRange: string) => {
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

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    updateFilters(type, searchQuery, selectedPriceRange);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    updateFilters(selectedType, search, selectedPriceRange);
  };

  const handlePriceRangeChange = (priceRange: string) => {
    setSelectedPriceRange(priceRange);
    updateFilters(selectedType, searchQuery, priceRange);
  };

  const handleSubmitReview = () => {
    if (selectedBusiness && newReview.review.trim()) {
      // TODO: Submit to backend
      console.log("Submitting review:", { business: selectedBusiness, review: newReview });
      setShowReviewForm(false);
      setSelectedBusiness(null);
      setNewReview({ rating: 5, review: "", priceRange: "$", tags: [] });
    }
  };

  const handleSubmitBusiness = () => {
    if (newBusiness.name.trim() && newBusiness.address.trim()) {
      // TODO: Submit to backend
      console.log("Submitting business:", newBusiness);
      setShowBusinessForm(false);
      setNewBusiness({
        name: "",
        type: "Restaurant",
        location: urlLocation,
        priceRange: "$",
        tags: [],
        address: "",
        phone: "",
        website: "",
        description: ""
      });
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        fill={i < rating ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      >
        <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Local Reviews</h1>
        <p className="text-gray-600">
          Discover and review the best local businesses in {urlLocation === "All Cities" ? "Thailand" : urlLocation}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Businesses</label>
            <Input
              placeholder="Search by business name or tags..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filters */}
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
        </CardContent>
      </Card>

      {/* Results Statistics */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold text-blue-600">{filteredBusinesses.length}</span> businesses
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBusinessForm(true)}>
            Add Business
          </Button>
          <Button onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        </div>
      </div>

      {/* Business List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.length > 0 ? (
          filteredBusinesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img 
                  src={business.image || "/sample.png"} 
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{business.name}</h3>
                  <span className="text-sm text-gray-500">{business.priceRange}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {renderStars(business.averageRating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {business.averageRating} ({business.totalReviews} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {business.type}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {business.location}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {business.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedBusiness(business);
                    setShowReviewForm(true);
                  }}
                >
                  Write Review
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-2">
                  No businesses found matching your search criteria
                  {urlLocation === "All Cities" ? " across all cities." : ` in ${urlLocation}.`}
                </p>
                <p className="text-sm text-gray-400">
                  {urlLocation === "All Cities" 
                    ? "Try adjusting your filters or search terms."
                    : "Try changing the location in the navigation bar above or adjust your filters."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Recent Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.authorAvatar} alt={review.author} />
                      <AvatarFallback>{review.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{review.businessName}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{review.businessType}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{review.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{review.priceRange}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 leading-relaxed">{review.review}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {review.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {review.author}</span>
                        <span>{review.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No reviews found yet.</p>
                <p className="text-sm text-gray-400 mt-2">Be the first to write a review!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Business Registration Form Modal */}
      {showBusinessForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                <Input
                  placeholder="Enter business name..."
                  value={newBusiness.name}
                  onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <div className="flex flex-wrap gap-2">
                  {validBusinessTypes.slice(0, -1).map((type) => (
                    <Button
                      key={type}
                      variant={newBusiness.type === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewBusiness({ ...newBusiness, type })}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Location Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="p-3 bg-gray-50 border rounded-md">
                  <span className="text-sm text-gray-700">
                    {urlLocation === "All Cities" ? "Please select a specific city" : urlLocation}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {urlLocation === "All Cities" 
                      ? "You need to select a specific city to add a business. Please change the location in the navigation bar above."
                      : "Location is automatically set based on your current selection"
                    }
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <Input
                  placeholder="Enter business address..."
                  value={newBusiness.address}
                  onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <Input
                  placeholder="Enter phone number..."
                  value={newBusiness.phone}
                  onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <Input
                  placeholder="Enter website URL..."
                  value={newBusiness.website}
                  onChange={(e) => setNewBusiness({ ...newBusiness, website: e.target.value })}
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  {validPriceRanges.slice(0, -1).map((range) => (
                    <Button
                      key={range}
                      variant={newBusiness.priceRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewBusiness({ ...newBusiness, priceRange: range })}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe the business..."
                  value={newBusiness.description}
                  onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <Input
                  placeholder="Enter tags separated by commas..."
                  value={newBusiness.tags.join(", ")}
                  onChange={(e) => setNewBusiness({ 
                    ...newBusiness, 
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)
                  })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitBusiness} className="flex-1">
                  Add Business
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowBusinessForm(false);
                    setNewBusiness({
                      name: "",
                      type: "Restaurant",
                      location: urlLocation,
                      priceRange: "$",
                      tags: [],
                      address: "",
                      phone: "",
                      website: "",
                      description: ""
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                Write a Review {selectedBusiness && `for ${selectedBusiness.name}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedBusiness && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <Input placeholder="Enter business name..." />
                </div>
              )}
              
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                  className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Share your experience..."
                  value={newReview.review}
                  onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  {validPriceRanges.slice(0, -1).map((range) => (
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
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSubmitReview} className="flex-1">
                  Submit Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowReviewForm(false);
                    setSelectedBusiness(null);
                    setNewReview({ rating: 5, review: "", priceRange: "$", tags: [] });
                  }}
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