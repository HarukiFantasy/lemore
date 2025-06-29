import { z } from "zod";
import { productSchema, type Product } from "~/lib/schemas";

// Today's Picks 선택 기준을 위한 스키마
const todayPicksCriteriaSchema = z.object({
  location: z.string().optional(),
  limit: z.number().min(1).max(10).default(4),
  includePopular: z.boolean().default(true),
  includeRecent: z.boolean().default(true),
  includeQuality: z.boolean().default(true),
});

export type TodayPicksCriteria = z.infer<typeof todayPicksCriteriaSchema>;

// 상품 점수 계산을 위한 인터페이스
interface ProductScore {
  product: Product;
  score: number;
  reasons: string[];
}

// Today's Picks 상품들을 가져오는 함수
export async function fetchTodaysPicks(criteria: Partial<TodayPicksCriteria> = {}): Promise<Product[]> {
  try {
    // 검증
    const validatedCriteria = todayPicksCriteriaSchema.parse(criteria);
    
    // TODO: 실제 데이터베이스에서 상품들을 가져오는 로직
    // 현재는 목업 데이터를 사용
    const allProducts = await fetchAllProductsFromDatabase();
    
    // 상품 점수 계산 및 정렬
    const scoredProducts = calculateProductScores(allProducts, validatedCriteria);
    
    // 상위 상품들 선택 (중복 제거 및 다양성 확보)
    const selectedProducts = selectDiverseProducts(scoredProducts, validatedCriteria.limit);
    
    return selectedProducts;
    
  } catch (error) {
    console.error("Error fetching today's picks:", error);
    throw new Error("Failed to fetch today's picks");
  }
}

// 모든 상품을 데이터베이스에서 가져오는 함수 (목업)
async function fetchAllProductsFromDatabase(): Promise<Product[]> {
  // TODO: 실제 데이터베이스 쿼리로 교체
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"] as const;
  const categories = ["Electronics", "Clothing", "Home goods", "Sports & Outdoor", "Books", "Toys and games"];
  const locations = ["Bangkok", "ChiangMai", "Phuket", "Pattaya"];
  
  return Array.from({ length: 50 }, (_, index) => ({
    id: `product-${index + 1}`,
    title: `Sample Product ${index + 1}`,
    price: `THB ${Math.floor(Math.random() * 5000) + 100}`,
    description: `This is a sample product description for item ${index + 1}.`,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    image: "/sample.png",
    sellerId: `seller-${index + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 최근 30일 내
    updatedAt: new Date(),
  }));
}

// 상품 점수 계산 함수
function calculateProductScores(products: Product[], criteria: TodayPicksCriteria): ProductScore[] {
  return products.map(product => {
    let score = 0;
    const reasons: string[] = [];
    
    // 1. 최신성 점수 (최근 7일 내 상품에 높은 점수)
    if (criteria.includeRecent) {
      const daysSinceCreation = (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation <= 7) {
        score += 30;
        reasons.push("Recently posted");
      } else if (daysSinceCreation <= 14) {
        score += 20;
        reasons.push("Posted within 2 weeks");
      } else if (daysSinceCreation <= 30) {
        score += 10;
        reasons.push("Posted within a month");
      }
    }
    
    // 2. 품질 점수 (상품 상태에 따른 점수)
    if (criteria.includeQuality) {
      switch (product.condition) {
        case "New":
          score += 25;
          reasons.push("New condition");
          break;
        case "Like New":
          score += 20;
          reasons.push("Like new condition");
          break;
        case "Good":
          score += 15;
          reasons.push("Good condition");
          break;
        case "Fair":
          score += 10;
          reasons.push("Fair condition");
          break;
        case "Poor":
          score += 5;
          reasons.push("Poor condition");
          break;
      }
    }
    
    // 3. 인기도 점수 (가격 대비 합리성, 카테고리 인기도 등)
    if (criteria.includePopular) {
      // 가격이 합리적인 상품에 높은 점수 (1000-3000 THB 범위)
      const priceValue = parseInt(product.price.replace("THB ", ""));
      if (priceValue >= 1000 && priceValue <= 3000) {
        score += 20;
        reasons.push("Reasonable price");
      } else if (priceValue < 1000) {
        score += 15;
        reasons.push("Great value");
      } else if (priceValue <= 5000) {
        score += 10;
        reasons.push("Fair price");
      }
      
      // 인기 카테고리에 추가 점수
      const popularCategories = ["Electronics", "Clothing", "Home goods"];
      if (popularCategories.includes(product.category)) {
        score += 10;
        reasons.push("Popular category");
      }
    }
    
    // 4. 위치 기반 점수 (사용자 위치와 일치하는 경우)
    if (criteria.location && product.location === criteria.location) {
      score += 15;
      reasons.push("Local item");
    }
    
    // 5. 랜덤 요소 (다양성 확보)
    score += Math.random() * 10;
    
    return {
      product,
      score,
      reasons
    };
  });
}

// 다양한 상품 선택 함수 (중복 카테고리 방지)
function selectDiverseProducts(scoredProducts: ProductScore[], limit: number): Product[] {
  // 점수순으로 정렬
  const sortedProducts = scoredProducts.sort((a, b) => b.score - a.score);
  
  const selected: Product[] = [];
  const usedCategories = new Set<string>();
  
  // 첫 번째 패스: 각 카테고리에서 최고 점수 상품 선택
  for (const scoredProduct of sortedProducts) {
    if (selected.length >= limit) break;
    
    if (!usedCategories.has(scoredProduct.product.category)) {
      selected.push(scoredProduct.product);
      usedCategories.add(scoredProduct.product.category);
    }
  }
  
  // 두 번째 패스: 남은 자리를 점수순으로 채움
  for (const scoredProduct of sortedProducts) {
    if (selected.length >= limit) break;
    
    if (!selected.some(p => p.id === scoredProduct.product.id)) {
      selected.push(scoredProduct.product);
    }
  }
  
  return selected.slice(0, limit);
}

// 특정 위치의 상품들을 가져오는 함수
export async function fetchProductsByLocation(location: string, limit: number = 20): Promise<Product[]> {
  try {
    const allProducts = await fetchAllProductsFromDatabase();
    return allProducts
      .filter(product => product.location === location)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching products by location:", error);
    throw new Error("Failed to fetch products by location");
  }
}

// 검색어로 상품을 검색하는 함수
export async function searchProducts(query: string, filters: any = {}): Promise<Product[]> {
  try {
    const allProducts = await fetchAllProductsFromDatabase();
    
    return allProducts.filter(product => {
      const searchLower = query.toLowerCase();
      return (
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    });
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Failed to search products");
  }
}

// 사용자의 모든 리스팅을 가져오는 함수
export async function fetchUserListings(userId: string): Promise<Product[]> {
  try {
    const allProducts = await fetchAllProductsFromDatabase();
    return allProducts
      .filter(product => product.sellerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error fetching user listings:", error);
    throw new Error("Failed to fetch user listings");
  }
}

// 사용자의 리스팅 개수를 가져오는 함수
export async function fetchUserListingsCount(userId: string): Promise<number> {
  try {
    const userListings = await fetchUserListings(userId);
    return userListings.length;
  } catch (error) {
    console.error("Error fetching user listings count:", error);
    throw new Error("Failed to fetch user listings count");
  }
} 