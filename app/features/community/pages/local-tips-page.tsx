import { useState, useEffect } from "react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router";
import { 
  localTipFiltersSchema, 
  localTipPostSchema, 
  localTipCreateSchema,
  VALID_LOCAL_TIP_CATEGORIES,
  type LocalTipFilters,
  type LocalTipPost,
  type LocalTipCreateData,
  type LocalTipCategory
} from "~/lib/schemas";
import { validateWithZod, getFieldErrors, getCategoryColors } from "~/lib/utils";
import { Route } from './+types/local-tips-page';

// 코멘트 타입 정의
type Comment = {
  id: number;
  postId: number;
  author: string;
  content: string;
  createdAt: Date;
  likes: number;
};

// 데이터베이스에서 가져올 포스트 타입 정의 (Zod 스키마에서 추론)
type LocalTipPostFromDB = LocalTipPost;

// 코멘트 데이터 가져오기 함수
async function fetchCommentsFromDatabase(postId: number): Promise<Comment[]> {
  try {
    // TODO: 실제 데이터베이스 연결 코드로 교체
    // 예시: const comments = await db.comments.findMany({ where: { postId } });
    
    // 목업 코멘트 데이터
    const mockComments: Comment[] = [
      {
        id: 1,
        postId: 1,
        author: "John Doe",
        content: "Great tip! I've been to Free Bird Cafe and they're really helpful.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        likes: 3
      },
      {
        id: 2,
        postId: 1,
        author: "Jane Smith",
        content: "Don't forget to check if they accept specific types of clothing before donating.",
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        likes: 1
      },
      {
        id: 3,
        postId: 2,
        author: "Mike Wilson",
        content: "I got my SIM at the airport and it was super easy. Just make sure you have your passport ready.",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        likes: 5
      },
      {
        id: 4,
        postId: 2,
        author: "Lisa Chen",
        content: "AIS has the best coverage in my experience, especially in rural areas.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 7
      },
      {
        id: 5,
        postId: 3,
        author: "David Brown",
        content: "Atsumi Raw Cafe is amazing! Their smoothie bowls are to die for.",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        likes: 4
      },
      {
        id: 6,
        postId: 4,
        author: "Sarah Kim",
        content: "The river boats are definitely the most scenic way to get around Bangkok!",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        likes: 6
      },
      {
        id: 7,
        postId: 5,
        author: "Tom Anderson",
        content: "Make sure to bring cash for the visa extension fee. They don't accept cards.",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        likes: 8
      },
      {
        id: 8,
        postId: 6,
        author: "Emma Davis",
        content: "Nimman area is great but can be expensive. Santitham is more affordable.",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        likes: 2
      }
    ];

    // 해당 포스트의 코멘트만 필터링
    return mockComments.filter(comment => comment.postId === postId);
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch comments from database");
  }
}

// 데이터베이스 연결 함수 (실제 구현 시 데이터베이스 클라이언트로 교체)
async function fetchLocalTipsFromDatabase(filters: LocalTipFilters): Promise<LocalTipPostFromDB[]> {
  try {
    // TODO: 실제 데이터베이스 연결 코드로 교체
    // 예시: const posts = await db.localTips.findMany({ where: filters });
    
    // 목업 데이터 반환
    const mockPosts: LocalTipPostFromDB[] = [
      {
        id: 1,
        title: "Best places to donate clothes in Chiang Mai",
        content: "Here are some great places where you can donate clothes in Chiang Mai: 1) Free Bird Cafe - they accept donations for Burmese refugees, 2) Second Chance Foundation - helps local communities, 3) Local temples often accept clothing donations. Make sure clothes are clean and in good condition before donating.",
        category: "Other",
        location: "ChiangMai",
        author: "Sarah Johnson",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 15,
        comments: 8,
        reviews: 12
      },
      {
        id: 2,
        title: "How to get a Thai SIM card as a foreigner",
        content: "Getting a Thai SIM card is quite straightforward. Here's what you need to know: 1) Bring your passport - it's required for registration, 2) AIS, True, and DTAC are the main providers, 3) You can buy at the airport, 7-Eleven, or official stores, 4) Tourist SIMs are available for short stays, 5) Data packages are very affordable compared to other countries.",
        category: "Other",
        location: "Bangkok",
        author: "Mike Chen",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        likes: 23,
        comments: 12,
        reviews: 8
      },
      {
        id: 3,
        title: "Best vegetarian restaurants in Phuket",
        content: "If you're looking for vegetarian options in Phuket, here are my top recommendations: 1) Atsumi Raw Cafe - amazing raw vegan food, 2) The Green Table - great Thai vegetarian dishes, 3) Pure Vegan Heaven - international vegan cuisine, 4) The Gallery Cafe - healthy options with ocean views. All these places have excellent food and reasonable prices.",
        category: "Other",
        location: "Phuket",
        author: "Emma Wilson",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        likes: 18,
        comments: 6,
        reviews: 15
      },
      {
        id: 4,
        title: "Transportation tips for getting around Bangkok",
        content: "Bangkok's transportation can be overwhelming. Here are some useful tips: 1) BTS Skytrain and MRT are the fastest ways to avoid traffic, 2) Grab app is better than hailing taxis, 3) Motorcycle taxis are great for short distances, 4) River boats are scenic and avoid traffic, 5) Avoid rush hours (7-9 AM and 5-7 PM) if possible.",
        category: "Transportation",
        location: "Bangkok",
        author: "David Kim",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        likes: 31,
        comments: 14,
        reviews: 22
      },
      {
        id: 5,
        title: "Visa extension process in Thailand",
        content: "Extending your visa in Thailand: 1) Go to Immigration Bureau (Chaengwattana for Bangkok), 2) Bring passport, departure card, photos, and proof of address, 3) Arrive early (before 8 AM) to avoid long queues, 4) Tourist visa can be extended for 30 days, 5) Cost is 1900 baht, 6) Processing usually takes 1-2 hours.",
        category: "Visa/Immigration",
        location: "Bangkok",
        author: "Lisa Park",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        likes: 42,
        comments: 19,
        reviews: 35
      },
      {
        id: 6,
        title: "Finding affordable housing in Chiang Mai",
        content: "Tips for finding affordable housing in Chiang Mai: 1) Check Facebook groups like 'Chiang Mai Housing', 2) Visit areas like Nimman, Santitham, or Hang Dong for different price ranges, 3) Negotiate rent - it's common practice, 4) Look for monthly rentals instead of daily rates, 5) Consider sharing with roommates to reduce costs.",
        category: "Housing",
        location: "ChiangMai",
        author: "Alex Thompson",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        likes: 28,
        comments: 11,
        reviews: 18
      },
      {
        id: 7,
        title: "Healthcare and insurance options for expats",
        content: "Healthcare options for expats in Thailand: 1) Public hospitals are cheap but crowded, 2) Private hospitals offer excellent care but are expensive, 3) Consider international health insurance, 4) Bumrungrad and Bangkok Hospital are top private options, 5) Local clinics are good for minor issues, 6) Always carry your insurance card.",
        category: "Healthcare/Insurance",
        location: "Bangkok",
        author: "Maria Garcia",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        likes: 35,
        comments: 16,
        reviews: 28
      },
      {
        id: 8,
        title: "Banking setup for foreigners in Thailand",
        content: "Setting up banking in Thailand: 1) You'll need a work permit or long-term visa, 2) Bangkok Bank and Kasikorn Bank are foreigner-friendly, 3) Bring passport, visa, and proof of address, 4) Some banks require a minimum deposit, 5) Online banking is available and very useful, 6) Consider getting a credit card for online purchases.",
        category: "Banking/Finance",
        location: "Bangkok",
        author: "Tom Anderson",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        likes: 19,
        comments: 7,
        reviews: 14
      },
      {
        id: 9,
        title: "Learning Thai language resources",
        content: "Best resources for learning Thai: 1) Apps: Duolingo, Memrise, and ThaiPod101, 2) YouTube channels: Learn Thai with Mod, 3) Language exchange meetups in Bangkok and Chiang Mai, 4) Private tutors can be found on Facebook groups, 5) Start with basic phrases and tones, 6) Practice with locals - they appreciate the effort.",
        category: "Education",
        location: "Bangkok",
        author: "Sophie Brown",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        likes: 26,
        comments: 9,
        reviews: 11
      },
      {
        id: 10,
        title: "Best time to visit different regions of Thailand",
        content: "Weather guide for Thailand: 1) Bangkok: November to February (cool season), 2) Chiang Mai: November to February (avoid burning season in March-April), 3) Phuket: November to April (dry season), 4) Koh Samui: January to September, 5) Avoid monsoon season (May-October) in most areas, 6) Book accommodation early during peak seasons.",
        category: "Other",
        location: "Bangkok",
        author: "Rachel Green",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        likes: 33,
        comments: 13,
        reviews: 20
      }
    ];

    // 필터링 로직
    let filteredPosts = mockPosts;
    
    if (filters.category && filters.category !== "All") {
      filteredPosts = filteredPosts.filter(post => post.category === filters.category);
    }
    
    if (filters.location && filters.location !== "All Cities") {
      filteredPosts = filteredPosts.filter(post => post.location === filters.location);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredPosts;
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch posts from database");
  }
}

// 새로운 포스트 생성 함수
async function createLocalTip(postData: LocalTipCreateData): Promise<LocalTipPost> {
  try {
    // TODO: 실제 데이터베이스 연결 코드로 교체
    // 예시: const newPost = await db.localTips.create({ data: postData });
    
    // Mock 데이터 반환
    const newPost: LocalTipPost = {
      id: Date.now(),
      title: postData.title,
      content: postData.content,
      category: postData.category,
      location: postData.location,
      author: "Current User", // 실제로는 로그인된 사용자 정보
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      reviews: 0,
    };
    
    return newPost;
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to create post");
  }
}

// 유효한 카테고리 목록 정의 (location은 navigation에서 관리)
const VALID_CATEGORIES = ["All", "Visa/Immigration", "Healthcare/Insurance", "Transportation", "Banking/Finance", "Housing", "Education", "Other"];

// 검증 함수들
function validateCategory(category: string | undefined): string {
  if (!category || category === "All") {
    return "All";
  }
  
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category: ${category}. Valid categories are: ${VALID_CATEGORIES.join(", ")}`);
  }
  
  return category;
}

function validateLocation(location: string | undefined): string {
  if (!location) {
    return "Bangkok"; // 기본값
  }
  
  // navigation의 cities 배열과 일치하는지 확인
  const validLocations = ["Bangkok", "ChiangMai", "HuaHin", "Phuket", "Pattaya", "Koh Phangan", "Koh Tao", "Koh Samui", "All Cities"];
  
  if (!validLocations.includes(location)) {
    throw new Error(`Invalid location: ${location}. Valid locations are: ${validLocations.join(", ")}`);
  }
  
  return location;
}

function validateSearchQuery(search: string | undefined): string {
  if (!search) {
    return "";
  }
  
  // 검색어 길이 제한
  if (search.length > 100) {
    throw new Error("Search query is too long. Maximum length is 100 characters.");
  }
  
  // 특수 문자 필터링 (XSS 방지)
  const sanitizedSearch = search.replace(/[<>]/g, "");
  
  return sanitizedSearch.trim();
}

// 데이터베이스 필터링 함수
function buildDatabaseFilters(validatedFilters: LocalTipFilters) {
  const filters: any = {};
  
  if (validatedFilters.category !== "All") {
    filters.category = validatedFilters.category;
  }
  
  // "All Cities"가 아닐 때만 location 필터 적용
  if (validatedFilters.location !== "All Cities") {
    filters.location = validatedFilters.location;
  }
  
  if (validatedFilters.search) {
    filters.search = validatedFilters.search;
  }
  
  return filters;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const rawFilters = {
      category: url.searchParams.get("category") || "All",
      location: url.searchParams.get("location") || "Bangkok",
      search: url.searchParams.get("search") || "",
    };

    // Zod를 사용한 데이터 검증
    const validationResult = validateWithZod(localTipFiltersSchema, rawFilters);
    
    if (!validationResult.success) {
      throw new Response(`Validation error: ${validationResult.errors.join(", ")}`, { 
        status: 400 
      });
    }

    const validatedFilters = validationResult.data;

    // 데이터베이스에서 포스트 가져오기
    const databaseFilters = buildDatabaseFilters({
      ...validatedFilters,
      search: validatedFilters.search || ""
    });
    const posts = await fetchLocalTipsFromDatabase(databaseFilters);

    // 각 포스트 검증
    const validatedPosts = posts.map(post => {
      const postValidation = validateWithZod(localTipPostSchema, post);
      if (!postValidation.success) {
        throw new Response(`Invalid post data: ${postValidation.errors.join(", ")}`, { 
          status: 500 
        });
      }
      return postValidation.data;
    });

    // 클라이언트에서 사용할 포스트 데이터 변환
    const transformedPosts = validatedPosts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      location: post.location,
      author: post.author,
      timeAgo: formatTimeAgo(post.createdAt),
      likes: post.likes,
      comments: post.comments
    }));

    return {
      posts: transformedPosts,
      filters: validatedFilters,
      totalCount: transformedPosts.length,
      validCategories: VALID_LOCAL_TIP_CATEGORIES
    };

  } catch (error) {
    // 에러 처리
    console.error("Loader error:", error);
    
    if (error instanceof Response) {
      // 이미 Response 객체인 경우 그대로 던지기
      throw error;
    }
    
    if (error instanceof Error) {
      // 데이터베이스 에러인 경우 500 Internal Server Error 반환
      if (error.message.includes("Failed to fetch posts from database")) {
        throw new Response("Database connection failed", { status: 500 });
      }
    }
    
    // 기타 에러는 500 Internal Server Error 반환
    throw new Response("Internal server error", { status: 500 });
  }
}

// 시간 포맷팅 유틸리티 함수
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
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

export default function LocalTipsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || "Bangkok";
  const [selectedCategory, setSelectedCategory] = useState<LocalTipCategory>(loaderData.filters.category);
  const [searchQuery, setSearchQuery] = useState(loaderData.filters.search || "");
  const [posts, setPosts] = useState(loaderData.posts);
  const [showPostForm, setShowPostForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [commentsData, setCommentsData] = useState<Record<number, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
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
      const createdPost = await createLocalTip(newPost);
      const transformedPost = {
        id: createdPost.id,
        title: createdPost.title,
        content: createdPost.content,
        category: createdPost.category,
        location: createdPost.location,
        author: createdPost.author,
        timeAgo: formatTimeAgo(createdPost.createdAt),
        likes: createdPost.likes,
        comments: createdPost.comments
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Local Tips</h1>
        <p className="text-muted-foreground">
          Share and discover helpful tips from the local community
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <Input
            type="text"
            placeholder="Search tips..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {loaderData.validCategories.map((category) => {
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
      </div>

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
          <Card key={post.id}>
            <CardContent className="p-6">
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