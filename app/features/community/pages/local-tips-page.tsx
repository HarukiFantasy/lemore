import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon } from "@heroicons/react/24/outline";
import { AvatarCircles } from "../../../../components/magicui/avatar-circles";
import { getCategoryColors, formatTimeAgo } from "~/lib/utils";
import { 
  LOCAL_TIP_CATEGORIES_WITH_ALL, 
  LocalTipCategoryWithAll, 
  LocalTipCategory 
} from "../constants";
import { localTipCategories } from "~/schema";
import { getLocalTipComments, getLocalTipPosts } from '../queries';
import type { Route } from "./+types/local-tips-page"
import { makeSSRClient } from "~/supa-client";

// Types

interface LocalTipPost {
  id: number;
  title: string;
  content: string;
  category: LocalTipCategory;
  location: string;
  author: string;
  username: string | null;
  avatar_url: string | null;
  stats: { likes: number; comments: number; reviews: number };
  created_at: Date;
  updated_at: Date;
}

interface Comment {
  comment_id: number;
  post_id: number;
  content: string;
  likes: number;
  created_at: string;
  author: {
    profile_id: string;
    username: string;
    avatar_url: string | null;
  };
}



export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const tips = await getLocalTipPosts(client);
  const comments = await getLocalTipComments(client);
  return { tips, comments };
}

export default function LocalTipsPage({ loaderData }: Route.ComponentProps) {
  const { tips, comments } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || "Bangkok";
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "All";
  
  // State for form inputs
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  // Group comments by post_id for easy lookup
  const commentsByPostId = comments.reduce((acc, comment) => {
    if (!acc[comment.post_id]) {
      acc[comment.post_id] = [];
    }
    acc[comment.post_id].push(comment);
    return acc;
  }, {} as Record<number, Comment[]>);

  // State for comment expansion
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  
  // Filter tips based on search and category
  const filteredTips = tips.filter((post) => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.username && post.username.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "All" || post.category === categoryFilter;
    const matchesLocation = urlLocation === "All Cities" || post.location === urlLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newSearchParams.set("search", searchInput.trim());
    } else {
      newSearchParams.delete("search");
    }
    setSearchParams(newSearchParams);
  };

  // Handle category filter click
  const handleCategoryClick = (category: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (category === "All") {
      newSearchParams.delete("category");
    } else {
      newSearchParams.set("category", category);
    }
    setSearchParams(newSearchParams);
  };

  // Check if content is long (more than 2 lines)
  const isContentLong = (content: string) => {
    // Remove HTML tags for line counting
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150; // Approximate 2 lines
  };

  // Handle comment expansion toggle
  const handleCommentToggle = (postId: number) => {
    if (expandedPosts.has(postId)) {
      // Collapse comments
      setExpandedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      // Expand comments
      setExpandedPosts(prev => new Set(prev).add(postId));
    }
  };
  
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
          <form onSubmit={handleSearchSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search tips..."
                  value={searchInput}
                  onChange={handleSearchChange}
                />
                <Button type="submit" variant="outline" size="sm">
                  Search
                </Button>
              </div>
            </div>
          </form>
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {LOCAL_TIP_CATEGORIES_WITH_ALL.map((category: LocalTipCategoryWithAll) => {
                const colors = getCategoryColors(category);
                const isActive = categoryFilter === category;
                return (
                  <Button
                    key={category}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={isActive ? `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}` : ""}
                    onClick={() => handleCategoryClick(category)}
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
          {filteredTips.length} tip{filteredTips.length !== 1 ? 's' : ''} found 
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
          {(searchQuery || categoryFilter !== "All") && (
            <span className="ml-2">
              {searchQuery && ` for "${searchQuery}"`}
              {categoryFilter !== "All" && ` in ${categoryFilter}`}
            </span>
          )}
        </p>
        <Button size="lg">
          Share a Tip
        </Button>
      </div>

      {/* Tips List */}
      <div className="space-y-4">
        {filteredTips.map((post) => (
          <Card key={post.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <CardContent className="py-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <div className="mb-3">
                    <div
                      className={`text-sm text-gray-700 ${
                        !expandedPosts.has(post.id) && isContentLong(post.content) 
                          ? 'line-clamp-2' 
                          : ''
                      }`}
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    {(isContentLong(post.content) || commentsByPostId[post.id]?.length > 0) && (
                      <button
                        onClick={() => handleCommentToggle(post.id)}
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
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {(post as any).username || 'Unknown User'}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(new Date(post.created_at))}</span>
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
                    <span>{(post.stats as { likes: number; comments: number; reviews: number }).reviews }</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HandThumbUpIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{(post.stats as { likes: number; comments: number; reviews: number}).likes }</span>
                  </div>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                    <span>{(post.stats as { likes: number; comments: number; reviews: number}).comments }</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedPosts.has(post.id) && (
                <div className="mt-4 pt-4 border-t">
                  {commentsByPostId[post.id] ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Comments ({commentsByPostId[post.id].length})</h4>
                      {commentsByPostId[post.id].map((comment: any ) => (
                        <div key={comment.comment_id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-sm">{comment.author.username}</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(new Date(comment.created_at))}</span>
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
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No comments yet</p>
                    </div>
                  )}
                </div>
              )} 
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTips.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== "All" 
                ? `No tips found matching your search criteria.` 
                : "No tips found. Be the first to share a tip!"
              }
            </p>
            <Button 
              onClick={() => {}} 
              className="mt-4"
              size="lg"
            >
              Share a Tip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Post Form Modal */}

    </div>
  );
} 