import { useState, useEffect } from "react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router";
import { AvatarCircles } from "../../../../components/magicui/avatar-circles";
import { z } from "zod";
import { localTipCategories } from "~/schema";
import { getFieldErrors, getCategoryColors, formatTimeAgo } from "~/lib/utils";
import { 
  LOCAL_TIP_CATEGORIES_WITH_ALL, 
  LocalTipCategoryWithAll, 
  LocalTipCategory 
} from "../constants";

// Types

interface LocalTipPost {
  id: string;
  title: string;
  content: string;
  category: LocalTipCategory;
  location: string;
  author: string;
  likes: number;
  comments: number;
  reviews: number;
  created_at: Date;
  updated_at: Date;
}

interface LocalTipCreateData {
  title: string;
  content: string;
  category: LocalTipCategory;
  location: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  likes: number;
  createdAt: Date;
  avatarUrl: string;
  profileUrl: string;
}

// Schema for form validation
const localTipCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
  category: z.enum(localTipCategories.enumValues as [string, ...string[]]),
  location: z.string().min(1, "Location is required")
});


export default function LocalTipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || "Bangkok";
  
  // Mock data inside the component
  const mockPosts: LocalTipPost[] = [
    {
      id: "1",
      title: "Best Visa Extension Process in Bangkok",
      content: "I recently extended my tourist visa at Chaengwattana. Here's what you need to know: 1) Arrive early (before 8 AM), 2) Bring all required documents including TM.30, 3) The process takes about 2-3 hours. Pro tip: Bring a book or work on your laptop while waiting!",
      category: "Visa",
      location: "Bangkok",
      author: "user1",
      likes: 24,
      comments: 8,
      reviews: 156,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "2",
      title: "Affordable Healthcare Options in Chiang Mai",
      content: "For those looking for quality healthcare without breaking the bank, I recommend McCormick Hospital. They have English-speaking staff and reasonable prices. Also, check out the government hospitals - they're much cheaper and the quality is surprisingly good.",
      category: "Health",
      location: "ChiangMai",
      author: "user2",
      likes: 18,
      comments: 12,
      reviews: 89,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: "3",
      title: "Getting Around Phuket: Transportation Tips",
      content: "Phuket's public transport can be tricky. Here are my tips: 1) Use Grab app for reliable taxi service, 2) Rent a scooter if you're comfortable (around 300-400 THB/day), 3) Songthaews are cheap but routes are limited, 4) Always negotiate prices before getting in a tuk-tuk.",
      category: "Transportation",
      location: "Phuket",
      author: "user3",
      likes: 31,
      comments: 15,
      reviews: 203,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: "4",
      title: "Opening a Bank Account as a Foreigner",
      content: "I successfully opened a bank account at Bangkok Bank. Requirements: passport, visa, proof of address (rental contract), and sometimes a letter from your embassy. The process took about 2 hours. They also offer good mobile banking apps.",
      category: "Bank",
      location: "Bangkok",
      author: "user4",
      likes: 42,
      comments: 20,
      reviews: 178,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: "5",
      title: "Finding Long-term Housing in Hua Hin",
      content: "Hua Hin is great for long-term stays! I found my apartment through Facebook groups and local real estate agents. Monthly rentals range from 15,000-30,000 THB for a decent 1-bedroom. Pro tip: Visit in person before signing any contracts.",
      category: "Other",
      location: "HuaHin",
      author: "user5",
      likes: 15,
      comments: 7,
      reviews: 67,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  const mockComments: Record<string, Comment[]> = {
    "1": [
      {
        id: "c1",
        author: "Sarah M.",
        content: "Great tip! I went there last week and it was exactly as described. The waiting time was about 2.5 hours.",
        likes: 5,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
        profileUrl: "/profile/sarah"
      },
      {
        id: "c2",
        author: "Mike T.",
        content: "Don't forget to bring copies of your passport! They require 2 copies.",
        likes: 3,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        profileUrl: "/profile/mike"
      }
    ],
    "2": [
      {
        id: "c3",
        author: "Emma L.",
        content: "I also recommend Chiang Mai Ram Hospital. They have excellent international patient services.",
        likes: 7,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        profileUrl: "/profile/emma"
      }
    ]
  };

  // Mock functions inside the component
  const fetchCommentsFromDatabase = async (postId: string): Promise<Comment[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockComments[postId] || [];
  };

  const createLocalTip = async (data: LocalTipCreateData): Promise<LocalTipPost> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPost: LocalTipPost = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      content: data.content,
      category: data.category,
      location: data.location,
      author: "current-user",
      likes: 0,
      comments: 0,
      reviews: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return newPost;
  };

  const [selectedCategory, setSelectedCategory] = useState<LocalTipCategoryWithAll>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<LocalTipPost[]>(mockPosts);
  const [showPostForm, setShowPostForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentsData, setCommentsData] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [commentAvatars, setCommentAvatars] = useState<Record<string, { imageUrl: string; profileUrl: string }[]>>({});
  const [newPost, setNewPost] = useState<LocalTipCreateData>({
    title: "",
    content: "",
    category: "Visa",
    location: urlLocation
  });

  // URL 파라미터와 상태 동기화
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const category = LOCAL_TIP_CATEGORIES_WITH_ALL.includes(categoryParam as any) 
      ? (categoryParam as LocalTipCategoryWithAll) 
      : "All";
    const search = searchParams.get("search") || "";
    
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [searchParams]);

  // Update location when URL changes
  useEffect(() => {
    setNewPost(prev => ({ ...prev, location: urlLocation }));
  }, [urlLocation]);

  // Load comment avatars for all posts on mount
  useEffect(() => {
    const loadCommentAvatars = async () => {
      const avatarPromises = posts.map(async (post) => {
        try {
          const comments = await fetchCommentsFromDatabase(post.id);
          return {
            postId: post.id,
            avatars: comments.slice(0, 3).map(comment => ({
              imageUrl: comment.avatarUrl,
              profileUrl: comment.profileUrl
            })),
            totalComments: comments.length
          };
        } catch (error) {
          console.error(`Error loading avatars for post ${post.id}:`, error);
          return {
            postId: post.id,
            avatars: [],
            totalComments: 0
          };
        }
      });

      const results = await Promise.all(avatarPromises);
      const avatarsMap: Record<string, { imageUrl: string; profileUrl: string }[]> = {};
      
      results.forEach(result => {
        avatarsMap[result.postId] = result.avatars;
      });

      setCommentAvatars(avatarsMap);
    };

    loadCommentAvatars();
  }, [posts]);

  const updateFilters = (newCategory: LocalTipCategoryWithAll, newSearch: string) => {
    const params = new URLSearchParams(searchParams);
    if (newCategory !== "All") {
      params.set("category", newCategory as LocalTipCategory);
    } else {
      params.delete("category");
    }
    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category: LocalTipCategory) => {
    setSelectedCategory(category as LocalTipCategoryWithAll);
    updateFilters(category as LocalTipCategoryWithAll, searchQuery);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    updateFilters(selectedCategory as LocalTipCategoryWithAll, search);
  };

  const validateForm = (): boolean => {
    const result = localTipCreateSchema.safeParse(newPost);
    
    if (!result.success) {
      const errors = getFieldErrors(localTipCreateSchema, newPost);
      setFormErrors(errors);
      return false;
    }
    
    setFormErrors({});
    return true;
  };

  const handleSubmitPost = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const createdPost = await createLocalTip(newPost);
      const transformedPost = {
        ...createdPost,
        timeAgo: formatTimeAgo(createdPost.created_at)
      };
      
      setPosts([transformedPost, ...posts]);
      setShowPostForm(false);
      setNewPost({
        title: "",
        content: "",
        category: "Visa",
        location: urlLocation
      });
      setFormErrors({});
    } catch (error) {
      console.error("Error creating post:", error);
      setFormErrors({ submit: error instanceof Error ? error.message : "Failed to create post" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePostExpansion = async (postId: string) => {
    const isCurrentlyExpanded = expandedPosts.has(postId);
    
    if (isCurrentlyExpanded) {
      // 축소하는 경우
      setExpandedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      // 확장하는 경우 - 코멘트도 함께 로드
      setExpandedPosts(prev => new Set(prev).add(postId));
      
      // 코멘트가 아직 로드되지 않았다면 로드
      if (!commentsData[postId]) {
        setLoadingComments(prev => new Set(prev).add(postId));
        
        try {
          const comments = await fetchCommentsFromDatabase(postId);
          setCommentsData(prev => ({
            ...prev,
            [postId]: comments
          }));
        } catch (error) {
          console.error("Error loading comments:", error);
        } finally {
          setLoadingComments(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
        }
      }
    }
  };

  // Filter posts based on current state
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesLocation = urlLocation === "All Cities" || post.location === urlLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-6xl mx-auto px-0 py-6 md:p-6">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold mb-2">Local Tips</h1>
        <p className="text-muted-foreground pb-6">
          Share and discover helpful tips from the local community
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
      </div>

      {/* Search andFilters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              type="text"
              placeholder="Search tips..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {LOCAL_TIP_CATEGORIES_WITH_ALL.map((category: LocalTipCategoryWithAll) => {
                const colors = getCategoryColors(category);
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category as LocalTipCategory)}
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

      {/* Results and Action Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground">
          {filteredPosts.length} tip{filteredPosts.length !== 1 ? 's' : ''} found
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
        <Button onClick={() => setShowPostForm(true)} size="lg">
          Share a Tip
        </Button>
      </div>

      {/* Tips List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <CardContent className="py-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <div className="mb-3">
                    <div
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <button
                      onClick={() => togglePostExpansion(post.id)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      {expandedPosts.has(post.id) ? (
                        <>
                          <ChevronUpIcon className="h-4 w-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="h-4 w-4" />
                          Show more
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.created_at)}</span>
                    <span>•</span>
                    <span>{post.location}</span>
                  </div>
                </div>
              </div>

              {/* Category and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const colors = getCategoryColors(post.category);
                    return (
                      <span className={`px-2 py-1 text-xs rounded-md ${colors.bg} ${colors.text} ${colors.border}`}>
                        {post.category}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{post.reviews}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HandThumbUpIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{post.likes}</span>
                  </div>
                  <button
                    onClick={() => togglePostExpansion(post.id)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                    <span>{post.comments}</span>
                    {commentAvatars[post.id] && commentAvatars[post.id].length > 0 && (
                      <AvatarCircles
                        avatarUrls={commentAvatars[post.id]}
                        numPeople={post.comments > 3 ? post.comments - 3 : 0}
                        className="scale-50 ml-1"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedPosts.has(post.id) && (
                <div className="mt-4 pt-4 border-t">
                  {loadingComments.has(post.id) ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
                    </div>
                  ) : commentsData[post.id] ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Comments ({commentsData[post.id].length})</h4>
                      {commentsData[post.id].map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                          </div>
                          <div
                            className="text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <HandThumbUpIcon className="h-3 w-3" />
                              <span>{comment.likes}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No tips found. Be the first to share a tip!</p>
            <Button 
              onClick={() => setShowPostForm(true)} 
              className="mt-4"
              size="lg"
            >
              Share a Tip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Share a Local Tip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Display */}
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {formErrors.submit}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <Input
                  placeholder="What's your tip about?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <div className="flex flex-wrap gap-2">
                  {localTipCategories.enumValues.map((category: LocalTipCategory) => {
                    const colors = getCategoryColors(category);
                    return (
                      <Button
                        key={category}
                        variant={newPost.category === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewPost({ ...newPost, category: category as LocalTipCategory })}
                        className={newPost.category === category ? `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}` : ""}
                      >
                        {category}
                      </Button>
                    );
                  })}
                </div>
                {formErrors.category && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  className={`w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.content ? "border-red-500" : ""}`}
                  placeholder="Share your helpful tip with the community..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
                {formErrors.content && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmitPost} 
                  className="flex-1"
                  disabled={isSubmitting || !newPost.title || !newPost.content}
                >
                  {isSubmitting ? "Posting..." : "Post Tip"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPostForm(false);
                    setNewPost({
                      title: "",
                      content: "",
                      category: "Visa",
                      location: urlLocation
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