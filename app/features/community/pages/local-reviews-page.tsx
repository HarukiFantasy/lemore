import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Separator } from "~/common/components/ui/separator";

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

const businessTypes = ["Restaurant", "Cafe", "Shop", "Service", "Entertainment", "All"];
const locations = ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Koh Samui", "All"];
const priceRanges = ["$", "$$", "$$$", "$$$$", "All"];

const sampleBusinesses: Business[] = [
  {
    id: "1",
    name: "Siam Street Food",
    type: "Restaurant",
    location: "Bangkok",
    averageRating: 4.5,
    totalReviews: 127,
    priceRange: "$",
    tags: ["Street Food", "Thai", "Quick Bite"],
    image: "/sample.png",
    address: "123 Sukhumvit Road, Bangkok",
    phone: "+66 2 123 4567",
    description: "Authentic Thai street food in the heart of Bangkok"
  },
  {
    id: "2",
    name: "Blue Elephant Cafe",
    type: "Cafe",
    location: "Chiang Mai",
    averageRating: 4.2,
    totalReviews: 89,
    priceRange: "$$",
    tags: ["Coffee", "Brunch", "WiFi"],
    image: "/sample.png",
    address: "456 Nimman Road, Chiang Mai",
    phone: "+66 53 987 6543",
    description: "Cozy cafe with great coffee and work-friendly atmosphere"
  },
  {
    id: "3",
    name: "Phuket Beach Boutique",
    type: "Shop",
    location: "Phuket",
    averageRating: 4.7,
    totalReviews: 203,
    priceRange: "$$$",
    tags: ["Fashion", "Beach", "Local"],
    image: "/sample.png",
    address: "789 Patong Beach Road, Phuket",
    phone: "+66 76 555 1234",
    description: "Local fashion boutique with unique beachwear and accessories"
  },
  {
    id: "4",
    name: "Pattaya Massage Spa",
    type: "Service",
    location: "Pattaya",
    averageRating: 4.3,
    totalReviews: 156,
    priceRange: "$$",
    tags: ["Spa", "Relaxation", "Wellness"],
    image: "/sample.png",
    address: "321 Walking Street, Pattaya",
    phone: "+66 38 777 8888",
    description: "Relaxing spa services in the heart of Pattaya"
  }
];

const sampleReviews: Review[] = [
  {
    id: "1",
    businessName: "Siam Street Food",
    businessType: "Restaurant",
    location: "Bangkok",
    rating: 5,
    review: "Amazing pad thai! The flavors are authentic and the portion size is generous. The staff is friendly and the prices are very reasonable. Highly recommend for anyone looking for authentic Thai street food experience.",
    author: "Sarah Johnson",
    authorAvatar: "/sample.png",
    timestamp: "2 hours ago",
    priceRange: "$",
    tags: ["Authentic", "Friendly Staff", "Good Value"]
  },
  {
    id: "2",
    businessName: "Blue Elephant Cafe",
    businessType: "Cafe",
    location: "Chiang Mai",
    rating: 4,
    review: "Great coffee and atmosphere. The avocado toast was delicious and the WiFi is fast. Perfect spot for working remotely. The only downside is it can get crowded during peak hours.",
    author: "Mike Chen",
    authorAvatar: "/sample.png",
    timestamp: "1 day ago",
    priceRange: "$$",
    tags: ["Good Coffee", "Work Friendly", "Crowded"]
  },
  {
    id: "3",
    businessName: "Phuket Beach Boutique",
    businessType: "Shop",
    location: "Phuket",
    rating: 5,
    review: "Beautiful local crafts and clothing. The owner is very knowledgeable about the products and their origins. Prices are fair for the quality. Found some unique souvenirs here!",
    author: "Emma Wilson",
    authorAvatar: "/sample.png",
    timestamp: "3 days ago",
    priceRange: "$$$",
    tags: ["Local Crafts", "Unique Items", "Knowledgeable Owner"]
  }
];

export default function LocalReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
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
    location: "Bangkok",
    priceRange: "$",
    tags: [] as string[],
    address: "",
    phone: "",
    website: "",
    description: ""
  });

  const filteredBusinesses = sampleBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "All" || business.type === selectedType;
    const matchesLocation = selectedLocation === "All" || business.location === selectedLocation;
    const matchesPrice = selectedPriceRange === "All" || business.priceRange === selectedPriceRange;
    
    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });

  const handleSubmitReview = () => {
    if (selectedBusiness && newReview.review.trim()) {
      // Here you would typically submit to your backend
      console.log("Submitting review:", { business: selectedBusiness, review: newReview });
      setShowReviewForm(false);
      setSelectedBusiness(null);
      setNewReview({ rating: 5, review: "", priceRange: "$", tags: [] });
    }
  };

  const handleSubmitBusiness = () => {
    if (newBusiness.name.trim() && newBusiness.address.trim()) {
      // Here you would typically submit to your backend
      console.log("Submitting business:", newBusiness);
      setShowBusinessForm(false);
      setNewBusiness({
        name: "",
        type: "Restaurant",
        location: "Bangkok",
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
        <p className="text-gray-600">Discover and review the best local businesses in your area</p>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
              <div className="flex flex-wrap gap-2">
                {businessTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <Button
                    key={location}
                    variant={selectedLocation === location ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLocation(location)}
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range) => (
                  <Button
                    key={range}
                    variant={selectedPriceRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPriceRange(range)}
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
        {filteredBusinesses.map((business) => (
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
        ))}
      </div>

      {/* Recent Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
        <div className="space-y-4">
          {sampleReviews.map((review) => (
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
          ))}
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
                  {businessTypes.slice(0, -1).map((type) => (
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

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex flex-wrap gap-2">
                  {locations.slice(0, -1).map((location) => (
                    <Button
                      key={location}
                      variant={newBusiness.location === location ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewBusiness({ ...newBusiness, location })}
                    >
                      {location}
                    </Button>
                  ))}
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
                  {priceRanges.slice(0, -1).map((range) => (
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
                      location: "Bangkok",
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
                  {priceRanges.slice(0, -1).map((range) => (
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