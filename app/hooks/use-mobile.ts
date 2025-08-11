import * as React from "react"

const MOBILE_BREAKPOINT = 768

// PHASE 3 OPTIMIZATION: Throttled mobile detection hook
export function useMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // OPTIMIZED: Throttled onChange to prevent excessive re-renders
    const onChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }, 100); // Throttle to 100ms
    }
    
    // OPTIMIZED: Use MediaQueryList listener instead of direct DOM query
    const handleChange = (e: MediaQueryListEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(e.matches);
      }, 100);
    }
    
    mql.addEventListener("change", handleChange);
    // Initial check
    setIsMobile(mql.matches);
    
    return () => {
      mql.removeEventListener("change", handleChange);
      clearTimeout(timeoutId);
    };
  }, [])

  return !!isMobile
}
