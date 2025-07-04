import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { z } from "zod";
import type { Route } from './+types/local-reviews-page';
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import { Marquee } from "components/magicui/marquee";

// Types
interface Review {
  id: string;
  business_id: string;
  rating: number;
  review: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  photos: string[];
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
const BUSINESS_TYPES = ["Restaurant", "Cafe", "Shop", "Service", "Entertainment", "All"] as const;
const PRICE_RANGES = ["$", "$$", "$$$", "$$$$", "All"] as const;
const VALID_LOCATIONS = ["Bangkok", "ChiangMai", "HuaHin", "Phuket", "Pattaya", "Koh Phangan", "Koh Tao", "Koh Samui", "All Cities"] as const;

// Zod Schemas
const BusinessTypeSchema = z.enum(BUSINESS_TYPES);
const PriceRangeSchema = z.enum(PRICE_RANGES);
const LocationSchema = z.enum(VALID_LOCATIONS);

const SearchQuerySchema = z.string()
  .max(100, "Search query is too long. Maximum length is 100 characters.")
  .transform(val => val.replace(/[<>]/g, "").trim())
  .optional()
  .default("");

const FilterSchema = z.object({
  type: BusinessTypeSchema.default("All"),
  location: LocationSchema.default("Bangkok"),
  search: SearchQuerySchema,
  priceRange: PriceRangeSchema.default("All")
});

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
    
    // 목업 데이터 반환
    const mockBusinesses: Business[] = [
      {
        id: "1",
        name: "Sukhumvit Thai Restaurant",
        type: "Restaurant",
        location: "Bangkok",
        averageRating: 4.5,
        totalReviews: 127,
        priceRange: "$$",
        tags: ["thai food", "authentic", "family-friendly"],
        image: "/sample.png",
        address: "123 Sukhumvit Road, Bangkok",
        phone: "+66 2 123 4567",
        website: "https://sukhumvit-thai.com",
        description: "Authentic Thai cuisine in a cozy atmosphere"
      },
      {
        id: "2",
        name: "Chiang Mai Coffee House",
        type: "Cafe",
        location: "ChiangMai",
        averageRating: 4.8,
        totalReviews: 89,
        priceRange: "$",
        tags: ["coffee", "organic", "local beans"],
        image: "/sample.png",
        address: "456 Nimman Road, Chiang Mai",
        phone: "+66 53 987 6543",
        website: "https://chiangmai-coffee.com",
        description: "Specialty coffee shop with locally sourced beans"
      },
      {
        id: "3",
        name: "Phuket Beach Massage",
        type: "Service",
        location: "Phuket",
        averageRating: 4.3,
        totalReviews: 203,
        priceRange: "$$",
        tags: ["massage", "beach", "relaxation"],
        image: "/sample.png",
        address: "789 Patong Beach Road, Phuket",
        phone: "+66 76 555 1234",
        website: "https://phuket-massage.com",
        description: "Professional massage services on the beach"
      },
      {
        id: "4",
        name: "Bangkok Electronics Store",
        type: "Shop",
        location: "Bangkok",
        averageRating: 4.1,
        totalReviews: 156,
        priceRange: "$$$",
        tags: ["electronics", "gadgets", "repair"],
        image: "/sample.png",
        address: "321 Silom Road, Bangkok",
        phone: "+66 2 789 0123",
        website: "https://bangkok-electronics.com",
        description: "Complete electronics store with repair services"
      },
      {
        id: "5",
        name: "Hua Hin Yoga Studio",
        type: "Entertainment",
        location: "HuaHin",
        averageRating: 4.7,
        totalReviews: 67,
        priceRange: "$$",
        tags: ["yoga", "wellness", "meditation"],
        image: "/sample.png",
        address: "654 Hua Hin Beach Road",
        phone: "+66 32 456 7890",
        website: "https://huahin-yoga.com",
        description: "Peaceful yoga studio with ocean views"
      },
      {
        id: "6",
        name: "Pattaya Seafood Market",
        type: "Shop",
        location: "Pattaya",
        averageRating: 4.4,
        totalReviews: 234,
        priceRange: "$$",
        tags: ["seafood", "fresh", "local market"],
        image: "/sample.png",
        address: "987 Walking Street, Pattaya",
        phone: "+66 38 123 4567",
        website: "https://pattaya-seafood.com",
        description: "Fresh seafood market with local specialties"
      }
    ];

    // 필터링 로직
    let filteredBusinesses = mockBusinesses;
    
    if (filters.type && filters.type !== "All") {
      filteredBusinesses = filteredBusinesses.filter(business => business.type === filters.type);
    }
    
    if (filters.location && filters.location !== "All Cities") {
      filteredBusinesses = filteredBusinesses.filter(business => business.location === filters.location);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredBusinesses = filteredBusinesses.filter(business => 
        business.name.toLowerCase().includes(searchLower) ||
        business.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.priceRange && filters.priceRange !== "All") {
      filteredBusinesses = filteredBusinesses.filter(business => business.priceRange === filters.priceRange);
    }
    
    return filteredBusinesses;
    
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
    
    // 목업 데이터 반환
    const mockReviews: Review[] = [
      {
        id: "1",
        business_id: "1",
        rating: 5,
        review: "Authentic Thai cuisine in a cozy atmosphere. The service was excellent and the food was delicious!",
        author: "Sarah Johnson",
        authorAvatar: "/sample.png",
        timestamp: "2 hours ago",
        photos: [],
        tags: ["authentic", "delicious", "friendly service"]
      },
      {
        id: "2",
        business_id: "1",
        rating: 5,
        review: "Authentic Thai cuisine in a cozy atmosphere. The service was excellent and the food was delicious!",
        author: "Sarah Johnson",
        authorAvatar: "/sample.png",
        timestamp: "5 hours ago",
        photos: [],
        tags: ["authentic", "delicious", "friendly service"]
      },
      {
        id: "3",
        business_id: "1",
        rating: 5,
        review: "Authentic Thai cuisine in a cozy atmosphere. The service was excellent and the food was delicious!",
        author: "Sarah Johnson",
        authorAvatar: "/sample.png",
        timestamp: "2 hours ago",
        photos: [],
        tags: ["authentic", "delicious", "friendly service"]
      },
      {
        id: "4",
        business_id: "1",
        rating: 5,
        review: "Authentic Thai cuisine in a cozy atmosphere. The service was excellent and the food was delicious!",
        author: "Sarah Johnson",
        authorAvatar: "/sample.png",
        timestamp: "2 hours ago",
        photos: [],
        tags: ["authentic", "delicious", "friendly service"]
      },
      {
        id: "5",
        business_id: "1",
        rating: 5,
        review: "Authentic Thai cuisine in a cozy atmosphere. The service was excellent and the food was delicious!",
        author: "Sarah Johnson",
        authorAvatar: "/sample.png",
        timestamp: "2 hours ago",
        photos: [],
        tags: ["authentic", "delicious", "friendly service"]
      }
    ];

    // 필터링 로직
    let filteredReviews = mockReviews;
    
    return filteredReviews.slice(0, filters.limit);
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch reviews from database");
  }
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

    // Data validation using Zod
    const validationResult = FilterSchema.safeParse({
      type,
      location,
      search,
      priceRange
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(err => err.message).join(", ");
      throw new Response(errorMessage, { status: 400 });
    }

    const { type: validatedType, location: validatedLocation, search: validatedSearch, priceRange: validatedPriceRange } = validationResult.data;

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
      business_id: review.business_id,
      rating: review.rating,
      review: review.review,
      author: review.author,
      authorAvatar: review.authorAvatar,
      timestamp: formatTimeAgo(new Date(review.timestamp)), 
      photos: review.photos,
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
    
    if (error instanceof Response) {
      // Re-throw validation and other HTTP errors
      throw error;
    }
    
    if (error instanceof Error) {
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
  const [selectedType, setSelectedType] = useState<z.infer<typeof BusinessTypeSchema>>(filters.type);
  const [selectedPriceRange, setSelectedPriceRange] = useState<z.infer<typeof PriceRangeSchema>>(filters.priceRange);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    review: "",
    tags: [] as string[]
  });
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    type: "Restaurant" as z.infer<typeof BusinessTypeSchema>,
    location: urlLocation as z.infer<typeof LocationSchema>,
    priceRange: "$" as z.infer<typeof PriceRangeSchema>,
    tags: [] as string[],
    address: "",
    phone: "",
    website: "",
    description: ""
  });

  // 상태 추가
  const [reviewStep, setReviewStep] = useState<'select' | 'newBusiness' | 'review'>('select');
  const [selectedOrNewBusiness, setSelectedOrNewBusiness] = useState<Business | null>(null);
  const [businessSearch, setBusinessSearch] = useState('');
  const [isAddingNewBusiness, setIsAddingNewBusiness] = useState(false);

  // 예시 태그 배열 추가
  const EXAMPLE_TAGS = [
    "Kind service", "Good value", "Clean", "Nice atmosphere", "Delicious", "Would revisit", "Recommend", "Fast service"
  ];

  useEffect(() => {
    setNewBusiness(prev => ({ ...prev, location: urlLocation as z.infer<typeof LocationSchema> }));
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

  const handleTypeChange = (type: z.infer<typeof BusinessTypeSchema>) => {
    setSelectedType(type);
    updateFilters(type, searchQuery, selectedPriceRange);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    updateFilters(selectedType, search, selectedPriceRange);
  };

  const handlePriceRangeChange = (priceRange: z.infer<typeof PriceRangeSchema>) => {
    setSelectedPriceRange(priceRange);
    updateFilters(selectedType, searchQuery, priceRange);
  };

  const handleSubmitReview = () => {
    if (selectedBusiness && newReview.review.trim()) {
      // TODO: Submit to backend
      console.log("Submitting review:", { business: selectedBusiness, review: newReview });
      setShowReviewForm(false);
      setSelectedBusiness(null);
      setNewReview({ rating: 5, review: "", tags: [] });
    }
  };

  const handleSubmitBusiness = () => {
    if (newBusiness.name.trim() && newBusiness.address.trim()) {
      // TODO: Submit to backend
      console.log("Submitting business:", newBusiness);
      setShowBusinessForm(false);
      setNewBusiness({
        name: "",
        type: "Restaurant" as z.infer<typeof BusinessTypeSchema>,
        location: urlLocation as z.infer<typeof LocationSchema>,
        priceRange: "$" as z.infer<typeof PriceRangeSchema>,
        tags: [],
        address: "",
        phone: "",
        website: "",
        description: ""
      });
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
        <h1 className="text-3xl font-bold text-gray-900">Local Reviews</h1>
        <p className="text-gray-600">
          Discover and review the best local businesses in {urlLocation === "All Cities" ? "Thailand" : urlLocation}
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
        <div>
          <Button variant="outline" onClick={() => setShowReviewForm(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Write Review
          </Button>
        </div>
      </div>

      {/* Business List (카드 통합) */}
      <div className="mt-10 space-y-6">
        {filteredBusinesses.length > 0 ? (
          filteredBusinesses.map((business) => {
            const businessReviews = reviews
              .filter((r) => r.business_id === business.id)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 3);
            // 모든 리뷰에서 태그를 모아 중복 없이 badge로 표시
            const allReviewTags = Array.from(new Set(
              reviews.filter(r => r.business_id === business.id).flatMap(r => r.tags)
            ));
            return (
              <Card
                key={business.id}
                className="flex flex-row hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer overflow-hidden"
              >
                {/* 왼쪽: 비즈니스 사진/정보 */}
                <div className="w-56 min-w-[14rem] bg-gray-50 flex flex-col items-center border-r border-gray-100 relative overflow-hidden p-0 -mt-6 -mb-6">
                  {/* 이미지: 높이 고정, 위에 배치, 상단 라운드 */}
                  <div className="w-full h-40 overflow-hidden flex-shrink-0 p-0">
                    <img
                      src={business.image || "/sample.png"}
                      alt={business.name}
                      className="object-cover w-full h-full rounded-t-lg"
                    />
                  </div>
                  {/* 정보: 이미지 아래, 배경 흰색 */}
                  <div className="w-full bg-white/90 p-3 text-center z-10">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate text-wrap">{business.name}</h3>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {renderStars(business.averageRating)}
                      <span className="ml-1 text-sm text-gray-600 font-medium">{business.averageRating.toFixed(1)}</span>
                    </div>
                    {/* 리뷰 태그 badge */}
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {allReviewTags.length > 0 ? (
                        allReviewTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium border border-purple-100"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No tags yet</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* 오른쪽: 리뷰 리스트 */}
                <ScrollArea className="flex-1 max-h-64">
                  <Marquee vertical repeat={2} className="h-full">
                    <div className="flex flex-col gap-6 justify-center p-6 -mt-6 -mb-6">
                      {businessReviews.length > 0 ? (
                        businessReviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={review.authorAvatar} alt={review.author} />
                                <AvatarFallback>{review.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm text-gray-800">{review.author}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{review.timestamp}</span>
                              <span className="ml-2 flex items-center">{renderStars(review.rating)}</span>
                            </div>
                            <div className="text-gray-700 text-sm mb-1">{review.review}</div>  
                              <div className="flex flex-wrap gap-1 mt-1">
                              </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-sm italic">No reviews yet for this business.</div>
                      )}
                    </div>
                  </Marquee>
                </ScrollArea>
              </Card>
            );
          })
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
                    : "Try changing the location in the navigation bar above or adjust your filters."}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
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
                      type: "Restaurant" as z.infer<typeof BusinessTypeSchema>,
                      location: urlLocation as z.infer<typeof LocationSchema>,
                      priceRange: "$" as z.infer<typeof PriceRangeSchema>,
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

      {/* Review Form Modal (비즈니스 선택/등록/리뷰 작성 통합) */}
      {showReviewForm && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {reviewStep === 'select' && 'Write a Review'}
                {reviewStep === 'newBusiness' && 'Add New Business'}
                {reviewStep === 'review' && `Write a Review for ${selectedOrNewBusiness?.name}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 1단계: 비즈니스 선택 */}
              {reviewStep === 'select' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select a Business</label>
                  <Input
                    placeholder="Search business name..."
                    value={businessSearch}
                    onChange={e => setBusinessSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                    {businesses
                      .filter(b => b.name.toLowerCase().includes(businessSearch.toLowerCase()))
                      .map(b => (
                        <Button
                          key={b.id}
                          variant="ghost"
                          className="w-full justify-start px-4 py-2 text-left hover:bg-blue-50"
                          onClick={() => {
                            setSelectedOrNewBusiness(b);
                            setReviewStep('review');
                          }}
                        >
                          <span className="font-medium text-gray-900">{b.name}</span>
                          <span className="ml-2 text-xs text-gray-500">{b.location}</span>
                        </Button>
                      ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-left hover:bg-purple-50 text-purple-700 font-semibold"
                      onClick={() => {
                        setIsAddingNewBusiness(true);
                        setReviewStep('newBusiness');
                      }}
                    >
                      + Add a new business
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => { setShowReviewForm(false); setReviewStep('select'); setSelectedOrNewBusiness(null); }}>Cancel</Button>
                  </div>
                </>
              )}
              {/* 2단계: 새 비즈니스 등록 */}
              {reviewStep === 'newBusiness' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                    <Input
                      placeholder="Enter business name..."
                      value={newBusiness.name}
                      onChange={e => setNewBusiness({ ...newBusiness, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {BUSINESS_TYPES.slice(0, -1).map(type => (
                        <Button
                          key={type}
                          variant={newBusiness.type === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewBusiness({ ...newBusiness, type })}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newBusiness.location}
                      onChange={e => setNewBusiness({ ...newBusiness, location: e.target.value as typeof VALID_LOCATIONS[number] })}
                    >
                      {VALID_LOCATIONS.slice(0, -1).map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <Input
                      placeholder="Enter business address..."
                      value={newBusiness.address}
                      onChange={e => setNewBusiness({ ...newBusiness, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <div className="flex gap-2">
                      {PRICE_RANGES.slice(0, -1).map(range => (
                        <Button
                          key={range}
                          variant={newBusiness.priceRange === range ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewBusiness({ ...newBusiness, priceRange: range })}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      className="w-full min-h-[80px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Describe the business..."
                      value={newBusiness.description}
                      onChange={e => setNewBusiness({ ...newBusiness, description: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        // 실제로는 DB에 비즈니스 등록 후, 등록된 business 객체를 setSelectedOrNewBusiness로 지정해야 함
                        setSelectedOrNewBusiness({ ...newBusiness, id: `new-${Date.now()}`, averageRating: 0, totalReviews: 0, tags: [] });
                        setReviewStep('review');
                      }}
                      className="flex-1"
                    >
                      Next: Write Review
                    </Button>
                    <Button variant="outline" onClick={() => { setReviewStep('select'); setIsAddingNewBusiness(false); }}>Back</Button>
                  </div>
                </>
              )}
              {/* 3단계: 리뷰 작성 */}
              {reviewStep === 'review' && selectedOrNewBusiness && (
                <>
                  <div className="mb-2">
                    <span className="block text-sm text-gray-500 mb-1">Business</span>
                    <span className="font-semibold text-gray-900">{selectedOrNewBusiness.name}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          <svg
                            className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{newReview.rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                    <textarea
                      className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Share your experience..."
                      value={newReview.review}
                      onChange={e => setNewReview({ ...newReview, review: e.target.value })}
                    />
                  </div>
                  {/* 예시 태그 badge */}
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2">
                      {EXAMPLE_TAGS.map(tag => {
                        const selected = newReview.tags.includes(tag);
                        return (
                          <Button
                            key={tag}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            size="sm"
                            className={selected ? "bg-gradient-to-r from-purple-200 to-blue-200 text-gray-700 border-none shadow" : ""}
                            onClick={() => {
                              if (selected) {
                                setNewReview({ ...newReview, tags: newReview.tags.filter(t => t !== tag) });
                              } else {
                                setNewReview({ ...newReview, tags: [...newReview.tags, tag] });
                              }
                            }}
                          >
                            {tag}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        // 실제로는 리뷰 등록 및 비즈니스 등록(필요시) 처리
                        setShowReviewForm(false);
                        setReviewStep('select');
                        setSelectedOrNewBusiness(null);
                        setNewReview({ rating: 5, review: '', tags: [] });
                      }}
                      className="flex-1"
                    >
                      Submit Review
                    </Button>
                    <Button variant="outline" onClick={() => { setReviewStep(isAddingNewBusiness ? 'newBusiness' : 'select'); }}>Back</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 