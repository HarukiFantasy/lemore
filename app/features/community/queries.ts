import { 
  type GiveAndGlowReview, 
  type GiveAndGlowFilters,
  giveAndGlowReviewSchema
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

    // Apply filters
    let filteredReviews = mockReviews;

    // Filter by category
    if (filters.category !== "All") {
      filteredReviews = filteredReviews.filter(review => review.itemCategory === filters.category);
    }

    // Filter by location
    if (filters.location !== "All") {
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