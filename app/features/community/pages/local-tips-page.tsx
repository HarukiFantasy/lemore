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

// Types

interface LocalTipPost {
  id: string;
  title: string;
  content: string;
  category: LocalTipCategory;
  location: string;
  author: string;
  stats: { likes: number; comments: number; reviews: number };
  created_at: Date;
  updated_at: Date;
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



export const loader = async () => {
  const tips = await getLocalTipPosts();
  const comments = await getLocalTipComments();
  return { tips, comments };
}

export default function LocalTipsPage({ loaderData }: Route.ComponentProps) {
  const { tips, comments } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || "Bangkok";
    
  
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
              value=""
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
                    variant="outline"
                    size="sm"
                    className=""
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
          2 tips found 
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
        <Button size="lg">
          Share a Tip
        </Button>
      </div>

      {/* Tips List */}
      <div className="space-y-4">
        {tips.map((post) => (
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
                      onClick={() => {}}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      <>
                          <ChevronDownIcon className="h-4 w-4" />
                          Show more
                        </>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {post.author}</span>
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
              {/* {expandedPosts.has(post.id) && (
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
              )} */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {tips.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No tips found. Be the first to share a tip!</p>
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