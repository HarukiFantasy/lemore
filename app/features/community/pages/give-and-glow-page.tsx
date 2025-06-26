import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Separator } from "~/common/components/ui/separator";

interface GiveAndGlowReview {
  id: string;
  itemName: string;
  itemCategory: string;
  giverName: string;
  giverAvatar?: string;
  receiverName: string;
  receiverAvatar?: string;
  rating: number;
  review: string;
  timestamp: string;
  location: string;
  tags: string[];
  photos?: string[];
  appreciationBadge?: boolean;
}

// Mock data for demonstration
const mockReviews: GiveAndGlowReview[] = [
  {
    id: "1",
    itemName: "Vintage Bookshelf",
    itemCategory: "Furniture",
    giverName: "Sarah Johnson",
    giverAvatar: "/sample.png",
    receiverName: "Mike Chen",
    receiverAvatar: "/sample.png",
    rating: 5,
    review: "Amazing bookshelf! Sarah was so kind to give it away for free. The quality is excellent and it fits perfectly in my study room. The pickup was smooth and she even helped me load it into my car. This is exactly what I needed for organizing my growing book collection.",
    timestamp: "2 hours ago",
    location: "Bangkok",
    tags: ["Excellent Condition", "Friendly Giver", "Smooth Pickup"],
    appreciationBadge: true
  },
  {
    id: "2",
    itemName: "Kitchen Appliances Set",
    itemCategory: "Kitchen",
    giverName: "Emma Wilson",
    giverAvatar: "/sample.png",
    receiverName: "David Kim",
    receiverAvatar: "/sample.png",
    rating: 4,
    review: "Great set of kitchen appliances! Emma was very generous to give away her barely used mixer, blender, and toaster. Everything works perfectly and they're in great condition. The communication was clear and the handover was quick and easy.",
    timestamp: "1 day ago",
    location: "Chiang Mai",
    tags: ["Good Condition", "Multiple Items", "Quick Handover"],
    appreciationBadge: true
  },
  {
    id: "3",
    itemName: "Children's Toys",
    itemCategory: "Toys",
    giverName: "Lisa Park",
    giverAvatar: "/sample.png",
    receiverName: "Anna Rodriguez",
    receiverAvatar: "/sample.png",
    rating: 5,
    review: "Wonderful collection of children's toys! Lisa was incredibly thoughtful and organized everything so well. My kids are absolutely thrilled with the new toys. Everything is clean and in excellent condition. Such a generous gesture!",
    timestamp: "3 days ago",
    location: "Phuket",
    tags: ["Clean Items", "Well Organized", "Kids Love It"],
    appreciationBadge: false
  },
  {
    id: "4",
    itemName: "Garden Tools",
    itemCategory: "Garden",
    giverName: "Tom Anderson",
    giverAvatar: "/sample.png",
    receiverName: "Maria Garcia",
    receiverAvatar: "/sample.png",
    rating: 4,
    review: "Perfect garden tools for my new balcony garden! Tom was very helpful and even gave me some gardening tips. The tools are in good condition and will definitely help me start my urban garden project. Very grateful for this generous gift.",
    timestamp: "5 days ago",
    location: "Bangkok",
    tags: ["Useful Items", "Helpful Giver", "Good Condition"],
    appreciationBadge: true
  }
];

const categories = ["All", "Furniture", "Electronics", "Clothing", "Books", "Kitchen", "Toys", "Garden", "Sports", "Other"];
const locations = ["All", "Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "Other"];

export default function GiveAndGlowPage() {
  const [reviews, setReviews] = useState<GiveAndGlowReview[]>(mockReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    itemName: "",
    itemCategory: "Furniture",
    giverName: "",
    rating: 5,
    review: "",
    location: "Bangkok",
    tags: ""
  });

  // Filter reviews based on search and filters
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.giverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || review.itemCategory === selectedCategory;
    const matchesLocation = selectedLocation === "All" || review.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleSubmitReview = () => {
    const review: GiveAndGlowReview = {
      id: Date.now().toString(),
      itemName: newReview.itemName,
      itemCategory: newReview.itemCategory,
      giverName: newReview.giverName,
      receiverName: "Current User", // In real app, this would be the logged-in user
      rating: newReview.rating,
      review: newReview.review,
      timestamp: "Just now",
      location: newReview.location,
      tags: newReview.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
      appreciationBadge: true // New reviews get appreciation badge
    };

    setReviews([review, ...reviews]);
    setShowReviewForm(false);
    setNewReview({
      itemName: "",
      itemCategory: "Furniture",
      giverName: "",
      rating: 5,
      review: "",
      location: "Bangkok",
      tags: ""
    });
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
        <p className="text-gray-600">Share appreciation for free items received and spread kindness in our community</p>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
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
          </div>
        </CardContent>
      </Card>

      {/* Results Statistics and Action Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold text-blue-600">{filteredReviews.length}</span> reviews
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
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <Input
                  placeholder="What item did you receive?"
                  value={newReview.itemName}
                  onChange={(e) => setNewReview({ ...newReview, itemName: e.target.value })}
                />
              </div>

              {/* Item Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1).map((category) => (
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
              </div>

              {/* Giver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"> Giver's Name *</label>
                <Input
                  placeholder="Who gave you this item?"
                  value={newReview.giverName}
                  onChange={(e) => setNewReview({ ...newReview, giverName: e.target.value })}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex flex-wrap gap-2">
                  {locations.slice(1).map((location) => (
                    <Button
                      key={location}
                      variant={newReview.location === location ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewReview({ ...newReview, location })}
                    >
                      {location}
                    </Button>
                  ))}
                </div>
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
              </div>
              
              {/* Review */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
                <textarea
                  className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Share your experience and appreciation for the free item you received..."
                  value={newReview.review}
                  onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
                <Input
                  placeholder="excellent condition, friendly giver, smooth pickup (comma separated)"
                  value={newReview.tags}
                  onChange={(e) => setNewReview({ ...newReview, tags: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmitReview} 
                  className="flex-1"
                  disabled={!newReview.itemName || !newReview.giverName || !newReview.review}
                >
                  Submit Review
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
                      location: "Bangkok",
                      tags: ""
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