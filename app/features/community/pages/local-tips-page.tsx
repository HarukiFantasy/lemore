import { useState, useEffect } from "react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router";
import { AvatarCircles } from "../../../../components/magicui/avatar-circles";
import { z } from "zod";
import { getFieldErrors, getCategoryColors } from "~/lib/utils";
import { 
  VALID_LOCAL_TIP_CATEGORIES,
  VALID_GIVE_AND_GLOW_LOCATIONS,
  type LocalTipCategory
} from "~/common/constants";

// Type definitions for the component props
interface LoaderData {
  filters: {
    category?: string;
    search?: string;
  };
  posts: any[];
  validCategories: string[];
}

interface ComponentProps {
  loaderData?: LoaderData;
}

interface ErrorBoundaryProps {
  error: Error;
}

// Zod Schemas for Local Tips
export const localTipFiltersSchema = z.object({
  category: z.enum(VALID_LOCAL_TIP_CATEGORIES as unknown as [string, ...string[]]).default("All"),
  location: z.enum(VALID_GIVE_AND_GLOW_LOCATIONS as unknown as [string, ...string[]]).default("Bangkok"),
  search: z.string().optional().default(""),
});

export const localTipPostSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be less than 5000 characters"),
  category: z.enum(VALID_LOCAL_TIP_CATEGORIES.filter(cat => cat !== "All") as unknown as [string, ...string[]]),
  location: z.enum(VALID_GIVE_AND_GLOW_LOCATIONS.filter(loc => loc !== "All Cities") as unknown as [string, ...string[]]),
  author: z.string().min(1, "Author is required").max(100, "Author must be less than 100 characters"),
  likes: z.number().min(0),
  comments: z.number().min(0),
  reviews: z.number().min(0),
  created_at: z.date(),
  updated_at: z.date(),
});

export const localTipCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be less than 5000 characters"),
  category: z.enum(VALID_LOCAL_TIP_CATEGORIES.filter(cat => cat !== "All") as unknown as [string, ...string[]]),
  location: z.enum(VALID_GIVE_AND_GLOW_LOCATIONS.filter(loc => loc !== "All Cities") as unknown as [string, ...string[]]),
});

// Type definitions
export type LocalTipFilters = z.infer<typeof localTipFiltersSchema>;
export type LocalTipCreateData = z.infer<typeof localTipCreateSchema>;

// 코멘트 타입 정의
type Comment = {
  id: number;
  postId: number;
  author: string;
  content: string;
  createdAt: Date;
  likes: number;
  avatarUrl: string;
  profileUrl: string;
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  const errorMessage = error instanceof Error ? error.message : "Something went wrong";
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
        <p className="text-gray-600">{errorMessage}</p>
      </div>
    </div>
  );
}

export default function LocalTipsPage({ loaderData }: ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || "Bangkok";
  const [selectedCategory, setSelectedCategory] = useState<LocalTipCategory>((loaderData?.filters?.category || "All") as LocalTipCategory);
  const [searchQuery, setSearchQuery] = useState(loaderData?.filters?.search || "");
  const [posts, setPosts] = useState(loaderData?.posts || []);
  const [showPostForm, setShowPostForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [commentsData, setCommentsData] = useState<Record<number, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
  const [commentAvatars, setCommentAvatars] = useState<Record<number, { imageUrl: string; profileUrl: string }[]>>({});
  const [newPost, setNewPost] = useState<LocalTipCreateData>({
    title: "",
    content: "",
    category: "Visa/Immigration",
    location: urlLocation as any
  });

  // URL 파라미터와 상태 동기화
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const category = VALID_LOCAL_TIP_CATEGORIES.includes(categoryParam as any) 
      ? (categoryParam as LocalTipCategory) 
      : "All";
    const search = searchParams.get("search") || "";
    
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [searchParams]);

  // Update location when URL changes
  useEffect(() => {
    setNewPost(prev => ({ ...prev, location: urlLocation as any }));
  }, [urlLocation]);

  const updateFilters = (newCategory: LocalTipCategory, newSearch: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (newCategory !== "All") {
      params.set("category", newCategory);
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
    setSelectedCategory(category);
    updateFilters(category, searchQuery);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    updateFilters(selectedCategory, search);
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
      // TODO: Replace with actual API call
      const mockCreatedPost = {
        id: Date.now().toString(),
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        location: newPost.location,
        author: "Current User", // TODO: Get from auth context
        created_at: new Date(),
        likes: 0,
        comments: 0,
        reviews: 0
      };

      const transformedPost = {
        id: mockCreatedPost.id,
        title: mockCreatedPost.title,
        content: mockCreatedPost.content,
        category: mockCreatedPost.category,
        location: mockCreatedPost.location as "Bangkok" | "ChiangMai" | "Phuket" | "HuaHin" | "Pattaya",
        author: mockCreatedPost.author,
        timeAgo: formatTimeAgo(mockCreatedPost.created_at),
        likes: mockCreatedPost.likes,
        comments: mockCreatedPost.comments,
        reviews: mockCreatedPost.reviews
      };
      
      setPosts([transformedPost, ...posts]);
      setShowPostForm(false);
      setNewPost({
        title: "",
        content: "",
        category: "Visa/Immigration",
        location: urlLocation as any
      });
      setFormErrors({});
    } catch (error) {
      console.error("Error creating post:", error);
      setFormErrors({ submit: error instanceof Error ? error.message : "Failed to create post" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePostExpansion = async (postId: number) => {
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
          // TODO: Replace with actual API call
          const mockComments: Comment[] = [
            {
              id: 1,
              postId: postId,
              author: "John Doe",
              content: "Great tip! Thanks for sharing.",
              createdAt: new Date(Date.now() - 30 * 60 * 1000),
              likes: 3,
              avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              profileUrl: "/profile/john-doe"
            }
          ];

          setCommentsData(prev => ({
            ...prev,
            [postId]: mockComments
          }));

          // Update comment avatars
          setCommentAvatars(prev => ({
            ...prev,
            [postId]: mockComments.slice(0, 3).map(comment => ({
              imageUrl: comment.avatarUrl,
              profileUrl: comment.profileUrl
            }))
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
  const filteredPosts = posts.filter((post: any) => {
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
              {(loaderData?.validCategories || VALID_LOCAL_TIP_CATEGORIES).map((category: string) => {
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
        {filteredPosts.map((post: any) => (
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
                    <span>{post.timeAgo}</span>
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
                  {VALID_LOCAL_TIP_CATEGORIES.filter(cat => cat !== "All").map((category) => {
                    const colors = getCategoryColors(category);
                    return (
                      <Button
                        key={category}
                        variant={newPost.category === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewPost({ ...newPost, category: category as any })}
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
                      category: "Visa/Immigration",
                      location: urlLocation as any
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