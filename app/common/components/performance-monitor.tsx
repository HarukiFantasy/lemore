// PHASE 4 OPTIMIZATION: Performance Monitoring and Web Vitals
import { useEffect } from 'react';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

// Web Vitals thresholds (Core Web Vitals)
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
};

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    console.log('🔍 Performance Monitor initialized - watching Web Vitals...');
    const metrics: PerformanceMetrics = {};

    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
            
            console.log('🎯 LCP:', `${metrics.lcp?.toFixed(2)}ms`, getMetricStatus('lcp', metrics.lcp));
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              metrics.fid = entry.processingStart - entry.startTime;
              
              console.log('⚡ FID:', `${metrics.fid?.toFixed(2)}ms`, getMetricStatus('fid', metrics.fid));
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift (CLS)
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            metrics.cls = clsValue;
            
            console.log('📐 CLS:', metrics.cls?.toFixed(3), getMetricStatus('cls', metrics.cls));
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

        } catch (error) {
          console.warn('Performance monitoring not supported:', error);
        }
      }
    };

    // Monitor Navigation Timing
    const observeNavigationTiming = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const [navigationEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        
        if (navigationEntry) {
          // First Contentful Paint
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            metrics.fcp = fcpEntry.startTime;
          }

          // Time to First Byte
          metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;

          console.log('🚀 Performance Metrics:');
          console.log('   FCP:', `${metrics.fcp?.toFixed(2)}ms`, getMetricStatus('fcp', metrics.fcp));
          console.log('   TTFB:', `${metrics.ttfb?.toFixed(2)}ms`, getMetricStatus('ttfb', metrics.ttfb));
          console.log('   DOM Load:', `${navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart}ms`);
          console.log('   Full Load:', `${navigationEntry.loadEventEnd - navigationEntry.fetchStart}ms`);
        }
      }
    };

    // Monitor Resource Loading
    const observeResourceTiming = () => {
      if ('performance' in window) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        const criticalResources = resources.filter(resource => 
          resource.name.includes('.js') || 
          resource.name.includes('.css') ||
          resource.name.includes('font')
        );

        if (criticalResources.length > 0) {
          console.log('📦 Resource Loading Times:');
          criticalResources
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5)
            .forEach(resource => {
              const name = resource.name.split('/').pop() || resource.name;
              console.log(`   ${name}: ${resource.duration.toFixed(2)}ms`);
            });
        }
      }
    };

    // Initialize monitoring
    observeNavigationTiming();
    observeWebVitals();
    
    // Delay resource timing to let everything load
    setTimeout(observeResourceTiming, 2000);

    // Send metrics to analytics (if needed in production)
    const sendMetricsToAnalytics = () => {
      if (process.env.NODE_ENV === 'production') {
        // You can send metrics to your analytics service here
        // Example: analytics.track('performance_metrics', metrics);
        console.log('📊 Production Metrics:', metrics);
      }
    };

    // Send metrics after page is fully loaded
    setTimeout(sendMetricsToAnalytics, 5000);

    // Make getPerformanceReport available globally
    if (typeof window !== 'undefined') {
      (window as any).getPerformanceReport = getPerformanceReport;
    }

  }, []);

  return null; // This component doesn't render anything
};

// Helper function to determine metric status
function getMetricStatus(metric: keyof typeof THRESHOLDS, value?: number): string {
  if (!value || !THRESHOLDS[metric]) return '';
  
  const { good, poor } = THRESHOLDS[metric];
  
  if (value <= good) return '✅ Good';
  if (value <= poor) return '⚠️ Needs Improvement';
  return '❌ Poor';
}

// Export for use in development tools
export const getPerformanceReport = () => {
  if (typeof window === 'undefined') return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    navigation: {
      ttfb: navigation.responseStart - navigation.requestStart,
      domLoad: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      fullLoad: navigation.loadEventEnd - navigation.fetchStart,
    },
    paint: paint.reduce((acc, entry) => {
      acc[entry.name] = entry.startTime;
      return acc;
    }, {} as Record<string, number>),
    memory: (performance as any).memory ? {
      used: ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
      total: ((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
      limit: ((performance as any).memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB',
    } : null,
  };
};