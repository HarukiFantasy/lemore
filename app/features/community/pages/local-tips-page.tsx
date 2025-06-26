import { useState } from "react";
import { CommunityPostCard } from "../components/community-post-card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Separator } from "../../../common/components/ui/separator";

// Mock data - in real implementation, this would come from API
const mockPosts = [
  {
    id: 1,
    title: "Complete Guide to Thai Visa Extension (2024)",
    content: "Everything you need to know about extending your visa in Thailand, including required documents and procedures...",
    category: "Visa/Immigration",
    location: "Bangkok",
    author: "John Smith",
    timeAgo: "2 hours ago",
    likes: 15,
    comments: 8
  },
  {
    id: 2,
    title: "How to Find and Visit Immigration Office in Bangkok",
    content: "Step-by-step guide to Bangkok Immigration Office location, transportation, and what to bring...",
    category: "Visa/Immigration",
    location: "Bangkok",
    author: "Sarah Johnson",
    timeAgo: "1 day ago",
    likes: 23,
    comments: 12
  },
  {
    id: 3,
    title: "Getting Foreigner ID Card in Chiang Mai",
    content: "Process and required documents for obtaining Foreigner ID Card in Chiang Mai Immigration...",
    category: "Visa/Immigration",
    location: "Chiang Mai",
    author: "Mike Chen",
    timeAgo: "3 days ago",
    likes: 18,
    comments: 6
  },
  {
    id: 4,
    title: "How to Get Health Insurance in Phuket",
    content: "Complete guide to health insurance options for expats living in Phuket...",
    category: "Healthcare/Insurance",
    location: "Phuket",
    author: "Emma Wilson",
    timeAgo: "5 days ago",
    likes: 31,
    comments: 15
  },
  {
    id: 5,
    title: "Transportation from Suvarnabhumi Airport to Bangkok City",
    content: "All transportation options from Suvarnabhumi Airport to Bangkok city center with price comparison...",
    category: "Transportation",
    location: "Bangkok",
    author: "David Brown",
    timeAgo: "1 week ago",
    likes: 45,
    comments: 22
  },
  {
    id: 6,
    title: "Opening a Bank Account in Pattaya",
    content: "Step-by-step process for foreigners to open a bank account in Pattaya...",
    category: "Banking/Finance",
    location: "Pattaya",
    author: "Lisa Anderson",
    timeAgo: "1 week ago",
    likes: 28,
    comments: 11
  },
  {
    id: 7,
    title: "Finding Long-term Rental in Koh Samui",
    content: "Tips and tricks for finding affordable long-term accommodation in Koh Samui...",
    category: "Housing",
    location: "Koh Samui",
    author: "Tom Davis",
    timeAgo: "2 weeks ago",
    likes: 35,
    comments: 18
  },
  {
    id: 8,
    title: "International Schools in Hua Hin",
    content: "Complete list of international schools in Hua Hin with fees and curriculum information...",
    category: "Education",
    location: "Hua Hin",
    author: "Maria Garcia",
    timeAgo: "2 weeks ago",
    likes: 42,
    comments: 25
  }
];

const categories = ["All", "Visa/Immigration", "Healthcare/Insurance", "Transportation", "Banking/Finance", "Housing", "Education", "Other"];
const locations = ["All", "Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Koh Samui", "Hua Hin", "Krabi", "Koh Phangan", "Other"];

export default function LocalTipsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = mockPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesLocation = selectedLocation === "All" || post.location === selectedLocation;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesLocation && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Local Tips for Expats</h1>
          <p className="text-gray-600">Share and discover useful information for living in Thailand</p>
        </div>

        {/* Filter and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Search by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
          </CardContent>
        </Card>

        {/* Results Statistics */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Total <span className="font-semibold text-blue-600">{filteredPosts.length}</span> posts
          </p>
        </div>

        {/* Post List */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.location}
                      </span>
                      <span>By: {post.author}</span>
                      <span>{post.timeAgo}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>👍 {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No posts found matching your search criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create New Post Button */}
        <div className="mt-8 text-center">
          <Button size="lg" className="px-8">
            Create New Post
          </Button>
        </div>
      </div>
    </div>
  );
} 