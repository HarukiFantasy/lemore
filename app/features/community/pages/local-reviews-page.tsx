import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { z } from "zod";;
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Marquee } from "components/magicui/marquee";
import { getLocalBusinesses, getLocalReviews } from "../queries";
import type { Route } from "./+types/local-reviews-page";
import { makeSSRClient } from '~/supa-client';

// Schema definitions
const BusinessTypeSchema = z.enum(["All", "Restaurant", "Cafe", "Bar", "Shop", "Service", "Other"]);
const PriceRangeSchema = z.enum(["All", "$", "$$", "$$$", "$$$$"]);
const LocationSchema = z.enum(["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "All Cities"]);


export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const businesses = await getLocalBusinesses(client);
  const reviews = await getLocalReviews(client);
  return { businesses, reviews };
}

// Main component
export default function LocalReviewsPage({ loaderData }: Route.ComponentProps) {
  const { businesses, reviews } = loaderData;
  
  // Debug logging
  console.log('Businesses data:', businesses);
  console.log('Reviews data:', reviews);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || "Bangkok";
  
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
    description: ""
  });
  const [newReview, setNewReview] = useState({
    rating: 5,
    review: "",
    priceRange: "$" as z.infer<typeof PriceRangeSchema>,
    tags: [] as string[]
  });

  // const mockBusinesses: MockBusiness[] = [
  //   {
  //     id: "1",
  //     name: "Siam Street Food",
  //     type: "Restaurant",
  //     location: "Bangkok",
  //     priceRange: "$",
  //     tags: ["street food", "local", "authentic", "quick"],
  //     address: "123 Sukhumvit Road, Bangkok",
  //     phone: "+66 2 123 4567",
  //     website: "https://siamstreetfood.com",
  //     description: "Authentic Thai street food in a casual setting. Famous for pad thai and tom yum soup.",
  //     image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
  //     averageRating: 4.5,
  //     totalReviews: 127
  //   },
  //   {
  //     id: "2",
  //     name: "Blue Moon Cafe",
  //     type: "Cafe",
  //     location: "Bangkok",
  //     priceRange: "$$",
  //     tags: ["coffee", "brunch", "wifi", "quiet"],
  //     address: "456 Silom Road, Bangkok",
  //     phone: "+66 2 234 5678",
  //     website: "https://bluemooncafe.com",
  //     description: "Cozy cafe with excellent coffee and brunch options. Perfect for remote work.",
  //     image: "https://images.unsplash.com/photo-1501339847302-ac426a4a87c8?w=400&h=300&fit=crop",
  //     averageRating: 4.2,
  //     totalReviews: 89
  //   },
  //   {
  //     id: "3",
  //     name: "Riverside Bar",
  //     type: "Bar",
  //     location: "Bangkok",
  //     priceRange: "$$$",
  //     tags: ["cocktails", "river view", "live music", "romantic"],
  //     address: "789 Chao Phraya Road, Bangkok",
  //     phone: "+66 2 345 6789",
  //     website: "https://riversidebar.com",
  //     description: "Elegant bar with stunning river views. Perfect for sunset cocktails and live jazz.",
  //     image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
  //     averageRating: 4.7,
  //     totalReviews: 203
  //   },
  //   {
  //     id: "4",
  //     name: "Thai Craft Market",
  //     type: "Shop",
  //     location: "Chiang Mai",
  //     priceRange: "$$",
  //     tags: ["handicrafts", "local artisans", "souvenirs", "unique"],
  //     address: "321 Nimman Road, Chiang Mai",
  //     phone: "+66 53 123 4567",
  //     website: "https://thaicraftmarket.com",
  //     description: "Local handicrafts and souvenirs from northern Thailand artisans.",
  //     image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
  //     averageRating: 4.3,
  //     totalReviews: 156
  //   },
  //   {
  //     id: "5",
  //     name: "Beach Massage Spa",
  //     type: "Service",
  //     location: "Phuket",
  //     priceRange: "$$",
  //     tags: ["massage", "spa", "relaxation", "beachfront"],
  //     address: "654 Patong Beach Road, Phuket",
  //     phone: "+66 76 234 5678",
  //     website: "https://beachmassagespa.com",
  //     description: "Relaxing massage and spa services with beautiful beach views.",
  //     image: "https://images.unsplash.com/photo-1544161512-84f9c86cbeb4?w=400&h=300&fit=crop",
  //     averageRating: 4.6,
  //     totalReviews: 342
  //   }
  // ];

  // const mockReviews: MockReview[] = [
  //   {
  //     id: "1",
  //     businessName: "Siam Street Food",
  //     businessType: "Restaurant",
  //     location: "Bangkok",
  //     author: "Sarah Johnson",
  //     authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  //     rating: 5,
  //     priceRange: "$",
  //     review: "",
  //     tags: ["authentic", "friendly staff", "generous portions"],
  //     timestamp: "2024-01-15T10:30:00Z"
  //   },
  //   {
  //     id: "1b",
  //     businessName: "Siam Street Food",
  //     businessType: "Restaurant",
  //     location: "Bangkok",
  //     author: "Leo Kim",
  //     authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  //     rating: 4,
  //     priceRange: "$",
  //     review: "Quick service and delicious noodles. The place is always busy but worth the wait!",
  //     tags: ["quick", "busy", "worth it"],
  //     timestamp: "2024-01-16T12:00:00Z"
  //   },
  //   {
  //     id: "1c",
  //     businessName: "Siam Street Food",
  //     businessType: "Restaurant",
  //     location: "Bangkok",
  //     author: "Mina Park",
  //     authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  //     rating: 5,
  //     priceRange: "$",
  //     review: "Best street food in Bangkok! Loved the spicy soup and the friendly staff.",
  //     tags: ["spicy", "best in town", "friendly staff"],
  //     timestamp: "2024-01-17T09:45:00Z"
  //   },
  //   {
  //     id: "2",
  //     businessName: "Blue Moon Cafe",
  //     businessType: "Cafe",
  //     location: "Bangkok",
  //     author: "Mike Chen",
  //     authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  //     rating: 4,
  //     priceRange: "$$",
  //     review: "Great coffee and excellent wifi for working. The avocado toast is delicious. A bit pricey but worth it for the quality and atmosphere.",
  //     tags: ["good coffee", "wifi", "quiet"],
  //     timestamp: "2024-01-14T14:20:00Z"
  //   },
  //   {
  //     id: "3",
  //     businessName: "Riverside Bar",
  //     businessType: "Bar",
  //     location: "Bangkok",
  //     author: "Emma Wilson",
  //     authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  //     rating: 5,
  //     priceRange: "$$$",
  //     review: "Stunning views and amazing cocktails! The live jazz band was incredible. Perfect for a romantic evening or special celebration.",
  //     tags: ["beautiful views", "live music", "romantic"],
  //     timestamp: "2024-01-13T19:15:00Z"
  //   }
  // ];

  // const businesses = mockBusinesses;
  // const reviews = mockReviews;
  const validBusinessTypes: z.infer<typeof BusinessTypeSchema>[] = ["All", "Restaurant", "Cafe", "Bar", "Shop", "Service", "Other"];
  const validPriceRanges: z.infer<typeof PriceRangeSchema>[] = ["All", "$", "$$", "$$$", "$$$$"];

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
                              (tag) => typeof tag === "string" && tag.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                          );
    const matchesType = selectedType === "All" || business.type === selectedType;
    const matchesLocation = urlLocation === "All Cities" || business.location === urlLocation;
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

  const handleSubmitReview = () => {
    if (selectedBusiness && newReview.review.trim()) {
      // TODO: Submit to backend
      console.log("Submitting review:", { business: selectedBusiness, review: newReview });
      setShowReviewForm(false);
      setSelectedBusiness(null);
      setNewReview({ rating: 5, review: "", priceRange: "$" as z.infer<typeof PriceRangeSchema>, tags: [] });
    }
  };

  const handleSubmitBusiness = () => {
    if (newBusiness.name.trim() && newBusiness.address.trim()) {
      // TODO: Submit to backend
      console.log("Submitting business:", newBusiness);
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

  // 비즈니스별 리뷰 매핑 - 필터링된 비즈니스만 사용
  const businessReviewPairs = filteredBusinesses.map((business) => {
    const businessReviews = reviews.filter((r: any) => r.business_id === business.id);
    console.log(`Business ${business.name} (ID: ${business.id}) has ${businessReviews.length} reviews:`, businessReviews);
    return { business, reviews: businessReviews };
  });

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

      {/* Results Statistics and Action Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold text-blue-600">{businessReviewPairs.length}</span> businesses
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
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
          businessReviewPairs.map(({ business, reviews }) => (
            <Card key={business.id} className="w-full">
              <div className="flex flex-col md:flex-row">
                {/* 좌측: 비즈니스 정보 */}
                <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center md:items-start -mb-6 -mt-6">
                  {/* 비즈니스 사진 - 카드 상단에 여백 없이 */}
                  <div className="w-full">
                    <img
                      src="/cafe1.png"
                      alt={business.name ?? ""}
                      className="w-full h-32 object-cover rounded-t-lg mb-0"
                    />
                  </div>
                  {/* 비즈니스 정보 */}
                  <div className="space-y-1 w-full p-4">
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
                        .filter((tag): tag is string => typeof tag === "string")
                        .map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{tag}</span>
                        ))
                    }
                  </div>
                </div>
                {/* 우측: 해당 비즈니스의 모든 리뷰 */}
                <CardContent className="flex-1 flex flex-col justify-between p-4 -mt-5 -mb-5">
                  <div className="max-h-64 overflow-y-auto pr-2">
                    <Marquee pauseOnHover vertical className="w-full">
                      <div className="flex flex-col gap-4 w-full">
                        {reviews.length > 0 ? reviews.map((review) => (
                          <div key={`${review.business_id}-${review.author}`} className="border-b last:border-b-0 pb-4 last:pb-0">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.author_avatar ?? ""} alt={review.author_username ?? ""} />
                                <AvatarFallback>{(review.author_username ?? "").split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-semibold text-md text-gray-900">{review.author_username}</div>
                                <div className="text-xs text-gray-500">{new Date(review.created_at ?? "").toLocaleDateString()}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  {renderStars(review.rating ?? 0)}
                                </div>
                                <div className="text-gray-700 mt-2 leading-relaxed">{review.content}</div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-gray-500 text-center">No reviews yet for this business.</div>
                        )}
                      </div>
                    </Marquee>
                  </div>
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

      {/* Write a Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {reviewStep === 'select-business' ? 'Select Business' : `Write a Review for ${selectedBusiness?.name}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewStep === 'select-business' ? (
                <>
                  {/* Step 1: Business Selection */}
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Choose an existing business or add a new one to write a review.
                    </div>
                    
                    {/* Existing Businesses */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        Existing Businesses
                      </h3>
                      
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
                          filteredBusinessesForSelection.map((business) => (
                            <div
                              key={business.id}
                              className="p-3 bg-white border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => {
                                setSelectedBusiness(business);
                                setReviewStep('write-review');
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{business.name}</h4>
                                  <p className="text-sm text-gray-600">{business.type} • {business.location}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{business.price_range}</span>
                                  <div className="flex items-center">
                                    {renderStars(business.average_rating ?? 0)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 bg-white border border-blue-200 rounded-lg">
                            <p className="mb-2">No businesses found matching "{businessSearchQuery}"</p>
                            <p className="text-sm">Try adding a new business below</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                      </div>
                    </div>

                    {/* Add New Business */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Business
                      </h3>
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
                            {validBusinessTypes.filter(type => type !== "All").map((type) => (
                              <Button
                                key={type}
                                variant={newBusiness.type === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => setNewBusiness({ ...newBusiness, type })}
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


                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: Write Review */}
                  <div className="space-y-4">
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
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-2 pt-4">
                {reviewStep === 'write-review' && (
                  <Button 
                    variant="outline"
                    onClick={() => setReviewStep('select-business')}
                  >
                    Back
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    if (reviewStep === 'select-business') {
                      // If we're in select-business step and have a new business filled out, create temp business
                      if (newBusiness.name.trim() && newBusiness.address.trim()) {
                        const tempBusiness: any = {
                          id: `temp-${Date.now()}`,
                          name: newBusiness.name,
                          type: newBusiness.type,
                          location: newBusiness.location,
                          price_range: newBusiness.priceRange,
                          tags: newBusiness.tags,
                          address: newBusiness.address,
                          phone: newBusiness.phone,
                          website: newBusiness.website,
                          description: newBusiness.description,
                          averageRating: 0,
                          totalReviews: 0
                        };
                        setSelectedBusiness(tempBusiness);
                        setReviewStep('write-review');
                      }
                    } else {
                      // If we're in write-review step, submit the review
                      handleSubmitReview();
                    }
                  }}
                  className="flex-1"
                  disabled={
                    (reviewStep === 'select-business' && (!newBusiness.name.trim() || !newBusiness.address.trim())) ||
                    (reviewStep === 'write-review' && !newReview.review.trim())
                  }
                >
                  {reviewStep === 'select-business' ? 'Continue' : 'Submit Review'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
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
    </div>
  );
} 