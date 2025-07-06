import { useState, useEffect } from "react";
import { checkAppreciationBadge } from "~/lib/utils";

// Cache for appreciation badge results to avoid repeated database calls
const appreciationBadgeCache = new Map<string, boolean>();

export function useAppreciationBadge(sellerId: string | undefined) {
  const [hasAppreciationBadge, setHasAppreciationBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sellerId || sellerId === "Multiple Owners") {
      setHasAppreciationBadge(false);
      return;
    }

    // Check cache first
    if (appreciationBadgeCache.has(sellerId)) {
      setHasAppreciationBadge(appreciationBadgeCache.get(sellerId)!);
      return;
    }

    // Fetch from database if not in cache
    const fetchAppreciationBadge = async () => {
      setIsLoading(true);
      try {
        const hasBadge = await checkAppreciationBadge(sellerId);
        appreciationBadgeCache.set(sellerId, hasBadge);
        setHasAppreciationBadge(hasBadge);
      } catch (error) {
        console.error("Error fetching appreciation badge:", error);
        setHasAppreciationBadge(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppreciationBadge();
  }, [sellerId]);

  return { hasAppreciationBadge, isLoading };
}

// Function to invalidate cache when new reviews are added
export const invalidateAppreciationBadgeCache = (sellerId?: string) => {
  if (sellerId) {
    appreciationBadgeCache.delete(sellerId);
  } else {
    appreciationBadgeCache.clear();
  }
}; 