import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface ChatMessage {
  type: 'ai' | 'user';
  content: string;
}

export interface AnalysisRequest {
  chatHistory?: ChatMessage[];
  itemName: string;
  situation: string;
  additionalContext?: string;
}

export async function generateAnalysis({ 
  chatHistory, 
  itemName, 
  situation,
  additionalContext 
}: AnalysisRequest) {
  const conversationText = chatHistory 
    ? chatHistory.map(msg => `${msg.type === 'ai' ? 'Joy' : 'User'}: ${msg.content}`).join('\n')
    : '';

  const prompt = `You are an expert at creating irresistible marketplace listings and analyzing decluttering conversations.

CONTEXT:
- Item: ${itemName}
- User's situation: ${situation}
${additionalContext ? `- Additional context: ${additionalContext}` : ''}
${conversationText ? `
CONVERSATION WITH JOY (Decluttering Coach):
${conversationText}
` : ''}

YOUR TASK:
Create a JSON response that includes both a commercial marketplace listing and emotional analysis.

LISTING REQUIREMENTS:
1. Make the title catchy and irresistible (include ONE emoji at the start)
2. Write a description that creates desire and urgency
3. Use psychological triggers (scarcity, value, social proof)
4. Be authentic and trustworthy, not scammy
5. Highlight specific benefits to buyers
6. Include a clear call-to-action

JSON STRUCTURE REQUIRED:
{
  "ai_listing_title": "emoji + catchy title under 40 chars that makes people want to click",
  "ai_listing_description": "150-200 word persuasive description with: attention-grabbing opening, key features/benefits, value proposition, urgency without being pushy, authentic tone, clear CTA",
  "ai_category": "Sell" or "Donate" or "Keep" (MUST be capitalized - based on emotional analysis),
  "item_category": "MUST choose from: Electronics, Clothing, Books, Home, Sports, Beauty, Toys, Automotive, Health, Other",
  "analysis_summary": "2-3 sentences explaining the recommendation based on the conversation",
  "emotion_summary": "brief description of user's emotional state (e.g., 'ready to let go', 'conflicted but practical')",
  "emotional_score": number 1-10 (1=no attachment, 10=very attached),
  "suggested_price": "price range if selling (e.g., '$25-40')",
  "target_buyer": "ideal buyer profile in 1 sentence"
}

IMPORTANT GUIDELINES:
- If it's food/kitchen items, emphasize hosting and entertaining value
- If it's electronics, focus on productivity and savings
- If it's clothing, highlight style and sustainability
- If it's books, emphasize knowledge and collection value
- If it's furniture, focus on transforming spaces
- If it's toys/games, emphasize joy and development
- If it's sports equipment, highlight fitness and adventure

Make the listing so compelling that buyers feel they NEED this item, while keeping it honest and authentic.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are an expert marketplace listing creator and emotional intelligence coach. You create listings that convert browsers into buyers while providing compassionate decluttering guidance."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // Slightly higher for more creative listings
      max_tokens: 800,
    });

    const result = response.choices[0].message?.content;
    if (!result) {
      throw new Error("OpenAI response was empty.");
    }

    const analysis = JSON.parse(result);
    
    // Ensure all required fields exist and proper capitalization
    return {
      ai_listing_title: analysis.ai_listing_title || `✨ ${itemName} - Great Deal!`,
      ai_listing_description: analysis.ai_listing_description || generateFallbackDescription(itemName),
      ai_category: capitalizeRecommendation(analysis.ai_category) || 'Sell', // Ensure proper capitalization
      item_category: analysis.item_category || categorizeItem(itemName), // Use AI's category or fallback
      analysis_summary: analysis.analysis_summary || `Based on your situation of ${situation}, this ${itemName} seems ready for a new chapter.`,
      emotion_summary: analysis.emotion_summary || 'ready to move forward',
      emotional_score: analysis.emotional_score || 5,
      suggested_price: analysis.suggested_price,
      target_buyer: analysis.target_buyer
    };

  } catch (error) {
    // Error calling OpenAI, using fallback
    
    // Return intelligent fallback
    return generateFallbackAnalysis(itemName, situation, conversationText);
  }
}

// Helper function to ensure proper capitalization for database enums
function capitalizeRecommendation(category: string): 'Sell' | 'Donate' | 'Keep' | undefined {
  if (!category) return undefined;
  const lower = category.toLowerCase();
  if (lower === 'sell') return 'Sell';
  if (lower === 'donate') return 'Donate';
  if (lower === 'keep') return 'Keep';
  return 'Sell'; // Default fallback
}

// Helper function to categorize items based on name - using exact schema enum values
function categorizeItem(itemName: string): 'Electronics' | 'Clothing' | 'Books' | 'Home' | 'Sports' | 'Beauty' | 'Toys' | 'Automotive' | 'Health' | 'Other' {
  const lowerItem = itemName.toLowerCase();
  
  // Electronics
  if (lowerItem.match(/laptop|phone|computer|tablet|camera|tv|electronic|headphone|speaker|mouse|keyboard|monitor|gaming|console|iphone|android|mac|pc/)) {
    return 'Electronics';
  }
  
  // Clothing  
  if (lowerItem.match(/shirt|dress|jacket|pants|clothes|shoe|bag|hat|belt|jewelry|watch|sock|underwear|coat|sweater|jeans|skirt|blouse/)) {
    return 'Clothing';
  }
  
  // Books
  if (lowerItem.match(/book|novel|magazine|textbook|journal|diary|comic|manual|guide|dictionary/)) {
    return 'Books';
  }
  
  // Home
  if (lowerItem.match(/furniture|chair|table|desk|sofa|shelf|lamp|decor|kitchen|cookware|appliance|bedding|curtain|rug|vase|mirror|frame/)) {
    return 'Home';
  }
  
  // Sports
  if (lowerItem.match(/ball|racket|weights|yoga|fitness|sports|bike|bicycle|skateboard|helmet|golf|tennis|basketball|football|soccer|gym/)) {
    return 'Sports';
  }
  
  // Beauty
  if (lowerItem.match(/makeup|cosmetic|skincare|perfume|lotion|shampoo|beauty|nail|hair|fragrance/)) {
    return 'Beauty';
  }
  
  // Toys
  if (lowerItem.match(/toy|game|puzzle|doll|lego|action figure|board game|stuffed|plush|educational toy/)) {
    return 'Toys';
  }
  
  // Automotive
  if (lowerItem.match(/car|auto|tire|engine|parts|motorcycle|vehicle|automotive|mechanic/)) {
    return 'Automotive';
  }
  
  // Health  
  if (lowerItem.match(/medical|health|vitamin|supplement|first aid|thermometer|scale|medicine|healthcare/)) {
    return 'Health';
  }
  
  // Default to Other
  return 'Other';
}

// Fallback function when OpenAI fails
function generateFallbackAnalysis(itemName: string, situation: string, conversation: string) {
  const lowerItem = itemName.toLowerCase();
  
  // Detect item category
  let emoji = '✨';
  let category = 'general';
  
  if (lowerItem.match(/cookie|cake|kitchen|cook|bake/)) {
    emoji = '🍪';
    category = 'kitchen';
  } else if (lowerItem.match(/laptop|phone|computer|tablet|electronic/)) {
    emoji = '💻';
    category = 'electronics';
  } else if (lowerItem.match(/shirt|dress|jacket|clothes|shoe/)) {
    emoji = '👗';
    category = 'fashion';
  } else if (lowerItem.match(/book|novel|magazine/)) {
    emoji = '📚';
    category = 'books';
  } else if (lowerItem.match(/guitar|piano|music/)) {
    emoji = '🎸';
    category = 'music';
  } else if (lowerItem.match(/toy|game|puzzle/)) {
    emoji = '🧸';
    category = 'toys';
  }
  
  const titles: Record<string, string> = {
    kitchen: `${emoji} Premium ${itemName} - Kitchen Essential!`,
    electronics: `${emoji} ${itemName} - Tech Deal Alert!`,
    fashion: `${emoji} Stylish ${itemName} - Fashion Find!`,
    books: `${emoji} ${itemName} - Must-Read Collection!`,
    music: `${emoji} ${itemName} - Musical Journey Awaits!`,
    toys: `${emoji} ${itemName} - Fun & Joy Guaranteed!`,
    general: `${emoji} Amazing ${itemName} - Don't Miss Out!`
  };
  
  return {
    ai_listing_title: titles[category],
    ai_listing_description: generateFallbackDescription(itemName),
    ai_category: 'Sell' as const, // Properly capitalized
    item_category: categorizeItem(itemName), // Use helper function for proper categorization
    analysis_summary: `Based on your ${situation} situation, selling this ${itemName} will help you move forward while giving it a new life with someone who needs it.`,
    emotion_summary: 'ready to let go',
    emotional_score: 5,
    suggested_price: '$25-50',
    target_buyer: 'Someone looking for quality items at great prices'
  };
}

function generateFallbackDescription(itemName: string): string {
  return `INCREDIBLE OPPORTUNITY! This ${itemName} is exactly what smart shoppers are looking for. 

Gently used and meticulously maintained - you won't find better condition at this price point! Perfect for anyone who appreciates quality without the retail markup. 

Why this is a must-have:
✓ Excellent condition - looks and works like new
✓ Fraction of retail price - save big!
✓ Ready to use immediately
✓ From a smoke-free, pet-free home

This won't last long at this price. Quality items like this get snapped up fast by savvy buyers who know value when they see it. 

Message now to secure this fantastic find - first come, first served! Your satisfaction is guaranteed.`;
}