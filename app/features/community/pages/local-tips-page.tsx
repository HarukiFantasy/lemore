import { useState, useEffect } from "react";
import { redirect, useSearchParams, Form, useActionData } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../../common/components/ui/avatar";
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon } from "@heroicons/react/24/outline";
import { getCategoryColors, formatTimeAgo } from "~/lib/utils";
import { 
  LOCAL_TIP_CATEGORIES_WITH_ALL, 
  LocalTipCategoryWithAll, 
  LocalTipCategory 
} from "../constants";
import { getLocalTipComments, getLocalTipPosts } from '../queries';
import { UserStatsHoverCard } from "../../../common/components/user-stats-hover-card";
import type { Route } from "./+types/local-tips-page"
import { makeSSRClient } from "~/supa-client";
import { Textarea } from "../../../common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../common/components/ui/dialog";
import { getlocations } from "../queries";
import { createLocalTip } from '../mutation';
import z from 'zod';

// Types

const formSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
});

interface Comment {
  comment_id: number;
  post_id: number;
  author: string;
  content: string;
  likes: number;
  created_at: string;
}


export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const tips = await getLocalTipPosts(client);
  const comments = await getLocalTipComments(client);
  const locations = await getlocations(client);  // 입력폼에서 사용
  const { data: { user } } = await client.auth.getUser();
  return { tips, comments, user, locations };
}


export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(Object.fromEntries(formData));
  if (!success) {
    return { fieldErrors: error.flatten().fieldErrors };
  }
  const { title, content, category, location } = data;
  await createLocalTip(client, {
    title,
    content,
    category,
    location,
    author: user?.id || '',
  });
  return redirect('/community/local-tips');
}


export default function LocalTipsPage({ loaderData }: Route.ComponentProps) {
  const { tips, comments, user, locations} = loaderData;
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || "Bangkok";
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "All";
  
  // State for form inputs
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  // State for tip sharing modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  
  // Close modal when action is successful
  useEffect(() => {
    if (actionData && !('fieldErrors' in actionData)) {
      setIsModalOpen(false);
      setSelectedCategory("");
      setSelectedLocation("");
    }
  }, [actionData]);
  
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

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
  };

  // Clear specific filter
  const handleClearFilter = (filterType: 'search' | 'category') => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filterType === 'search') {
      newSearchParams.delete("search");
      setSearchInput("");
    } else if (filterType === 'category') {
      newSearchParams.delete("category");
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


  // Open modal
  const openTipModal = () => {
    setIsModalOpen(true);
    setSelectedCategory("Other");
    setSelectedLocation(urlLocation);
  };

  // Close modal
  const closeTipModal = () => {
    setIsModalOpen(false);
    setSelectedCategory("");
    setSelectedLocation("");
  };

  // Handle dialog close
  const handleDialogClose = () => {
    closeTipModal();
  };
  
  return (
    <div className="max-w-6xl mx-auto px-0 py-6 md:p-6">
      
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold mb-2">Local Tips</h1>
        <p className="text-muted-foreground pb-6">
          Share and discover helpful tips from the local community  in {urlLocation}</p>
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

      {/* Active filters display and clear */}
      {(searchQuery || categoryFilter !== "All") && (
        <div className="mb-6 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchQuery && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={() => handleClearFilter('search')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </div>
          )}
          {categoryFilter !== "All" && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <span>Category: {categoryFilter}</span>
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

        {/* Share a Tip Button */}
        {user && (
          <Button size="lg" onClick={openTipModal}>
            Share a Tip
          </Button>
        )}
        
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
                    <div className="flex items-center gap-2">
                      <span>By</span>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.avatar_url || undefined} alt={(post as any).username || 'Unknown User'} />
                        <AvatarFallback className="text-xs">
                          {(post as any).username ? (post as any).username.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <UserStatsHoverCard
                        userName={(post as any).username || 'Unknown User'}
                      >
                        {(post as any).username || 'Unknown User'}
                      </UserStatsHoverCard>
                    </div>
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
            {user && (
              <Button 
                onClick={openTipModal} 
                className="mt-4 cursor-pointer"
                size="lg"
              >
                Share a Tip
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Post Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share a Tip</DialogTitle>
          </DialogHeader>
          
          <Form method="post" className="space-y-6 w-full">
            <div className="w-full">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tip Title *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Enter a catchy title for your tip..."
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCAL_TIP_CATEGORIES_WITH_ALL.filter(cat => cat !== "All").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="category" value={selectedCategory} />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location: any) => (
                      <SelectItem key={location.location_id} value={location.name}>
                        {location.display_name || location.name}
                      </SelectItem> 
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="location" value={selectedLocation} />
              </div>
            </div>

            <div className="w-full">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Tip Content *
              </label>
              <Textarea
                id="content"
                name="content"
                placeholder="Share your helpful tip with the community..."
                rows={6}
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Share your local knowledge, recommendations, or helpful advice!
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeTipModal}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Share Tip
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
} 