import { 
  type GiveAndGlowReview, 
  type GiveAndGlowFilters,
  giveAndGlowReviewSchema,
  type LocalTipPost,
  type Question
} from "~/lib/schemas";
import { validateWithZod } from "~/lib/utils";

// Mock database function for fetching give-and-glow reviews
export async function fetchGiveAndGlowReviewsFromDatabase(filters: GiveAndGlowFilters): Promise<GiveAndGlowReview[]> {
  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock data - in real app, this would be a database query
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
        location: "ChiangMai",
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

    // Apply filters
    let filteredReviews = mockReviews;

    // Filter by category
    if (filters.category !== "All") {
      filteredReviews = filteredReviews.filter(review => review.itemCategory === filters.category);
    }

    // Filter by location
    if (filters.location !== "All Cities") {
      filteredReviews = filteredReviews.filter(review => review.location === filters.location);
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredReviews = filteredReviews.filter(review => 
        review.itemName.toLowerCase().includes(searchLower) ||
        review.giverName.toLowerCase().includes(searchLower) ||
        review.review.toLowerCase().includes(searchLower)
      );
    }

    // Validate each review before returning
    const validatedReviews: GiveAndGlowReview[] = [];
    for (const review of filteredReviews) {
      const validation = validateWithZod(giveAndGlowReviewSchema, review);
      if (validation.success) {
        validatedReviews.push(validation.data);
      } else {
        console.error(`Invalid review data for ID ${review.id}:`, validation.errors);
        // In production, you might want to skip invalid reviews or handle them differently
      }
    }

    return validatedReviews;

  } catch (error) {
    console.error("Error fetching give-and-glow reviews from database:", error);
    throw new Error("Failed to fetch give-and-glow reviews from database");
  }
}

// Mock database function for creating a new give-and-glow review
export async function createGiveAndGlowReview(reviewData: Omit<GiveAndGlowReview, 'id' | 'timestamp' | 'appreciationBadge'>): Promise<GiveAndGlowReview> {
  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const newReview: GiveAndGlowReview = {
      ...reviewData,
      id: Date.now().toString(),
      timestamp: "Just now",
      appreciationBadge: true // New reviews get appreciation badge
    };

    // Validate the new review
    const validation = validateWithZod(giveAndGlowReviewSchema, newReview);
    if (!validation.success) {
      throw new Error(`Invalid review data: ${validation.errors.join(", ")}`);
    }

    return validation.data;

  } catch (error) {
    console.error("Error creating give-and-glow review:", error);
    throw new Error("Failed to create give-and-glow review");
  }
}

// Mock database function for fetching latest local tips
export async function fetchLatestLocalTips(limit: number = 5): Promise<LocalTipPost[]> {
  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock data for local tips
    const mockLocalTips: LocalTipPost[] = [
      {
        id: 1,
        title: "Best places to donate clothes in Chiang Mai",
        content: "Here are some great places where you can donate clothes in Chiang Mai...",
        category: "Other",
        location: "ChiangMai",
        author: "Sarah Johnson",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 15,
        comments: 8
      },
      {
        id: 2,
        title: "How to get a Thai SIM card as a foreigner",
        content: "Getting a Thai SIM card is quite straightforward. Here's what you need to know...",
        category: "Other",
        location: "Bangkok",
        author: "Mike Chen",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        likes: 23,
        comments: 12
      },
      {
        id: 3,
        title: "Best vegetarian restaurants in Phuket",
        content: "If you're looking for vegetarian options in Phuket, here are my top recommendations...",
        category: "Other",
        location: "Phuket",
        author: "Emma Wilson",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        likes: 18,
        comments: 6
      },
      {
        id: 4,
        title: "Transportation tips for getting around Bangkok",
        content: "Bangkok's transportation can be overwhelming. Here are some useful tips...",
        category: "Transportation",
        location: "Bangkok",
        author: "David Kim",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        likes: 31,
        comments: 14
      },
      {
        id: 5,
        title: "Healthcare insurance options for expats",
        content: "Finding the right healthcare insurance in Thailand can be tricky. Here's what I learned...",
        category: "Healthcare/Insurance",
        location: "ChiangMai",
        author: "Lisa Park",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        likes: 27,
        comments: 9
      }
    ];

    // Return the latest tips based on limit
    return mockLocalTips.slice(0, limit);

  } catch (error) {
    console.error("Error fetching latest local tips:", error);
    throw new Error("Failed to fetch latest local tips");
  }
}

// Mock database function for fetching latest questions
export async function fetchLatestQuestions(limit: number = 5): Promise<Question[]> {
  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock data for questions
    const mockQuestions: Question[] = [
      {
        id: "1",
        title: "Where can I find good quality second-hand furniture?",
        content: "I'm looking for affordable second-hand furniture in Bangkok. Any recommendations for reliable shops or online platforms?",
        author: "Anna Rodriguez",
        timestamp: "1 hour ago",
        tags: ["Furniture", "Bangkok", "Second-hand"],
        answers: [
          {
            id: "1",
            content: "I recommend checking out Chatuchak Weekend Market. There are several vendors selling good quality second-hand furniture at reasonable prices.",
            author: "Tom Anderson",
            timestamp: "30 minutes ago",
            isAccepted: false
          }
        ]
      },
      {
        id: "2",
        title: "Best way to sell electronics safely?",
        content: "I have some electronics I want to sell but I'm worried about safety. What's the best way to meet buyers safely?",
        author: "Maria Garcia",
        timestamp: "3 hours ago",
        tags: ["Electronics", "Safety", "Selling"],
        answers: [
          {
            id: "2",
            content: "Always meet in public places like shopping malls or coffee shops. I also recommend meeting during daylight hours and bringing a friend if possible.",
            author: "John Smith",
            timestamp: "2 hours ago",
            isAccepted: true
          }
        ]
      },
      {
        id: "3",
        title: "Looking for vintage clothing stores",
        content: "I'm interested in vintage clothing. Are there any good vintage stores in Chiang Mai?",
        author: "Sophie Lee",
        timestamp: "5 hours ago",
        tags: ["Clothing", "Vintage", "Chiang Mai"],
        answers: []
      },
      {
        id: "4",
        title: "How to donate books effectively?",
        content: "I have a lot of books I want to donate. What's the best way to donate them so they actually get used?",
        author: "Carlos Mendez",
        timestamp: "7 hours ago",
        tags: ["Books", "Donation"],
        answers: [
          {
            id: "3",
            content: "You can donate to local libraries, schools, or community centers. Some coffee shops also have book exchange programs.",
            author: "Rachel Green",
            timestamp: "6 hours ago",
            isAccepted: false
          }
        ]
      },
      {
        id: "5",
        title: "Sports equipment exchange groups?",
        content: "Are there any groups or platforms for exchanging sports equipment in Phuket?",
        author: "Alex Turner",
        timestamp: "9 hours ago",
        tags: ["Sports", "Exchange", "Phuket"],
        answers: []
      }
    ];

    // Return the latest questions based on limit
    return mockQuestions.slice(0, limit);

  } catch (error) {
    console.error("Error fetching latest questions:", error);
    throw new Error("Failed to fetch latest questions");
  }
} 