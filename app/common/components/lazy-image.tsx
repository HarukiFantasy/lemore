// PHASE 3 OPTIMIZATION: Lazy Loading Image Component with Blur Effect
import React, { useState, useCallback, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  rootMargin?: string;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

// Generate a blurred, low-quality placeholder from the original image
const generateBlurDataUrl = (): string => {
  // Create a tiny blurred version using CSS filter as data URL
  // This creates a 1x1 pixel with average color estimation
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f3f4f6'; // Light gray as fallback
    ctx.fillRect(0, 0, 1, 1);
  }
  return canvas.toDataURL();
};

export const LazyImage = React.memo<LazyImageProps>(({
  src,
  alt,
  placeholder,
  fallback = '/lemore-logo.png',
  rootMargin = '50px',
  threshold = 0.1,
  onLoad,
  onError,
  className = '',
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Create blurred placeholder effect immediately
  useEffect(() => {
    if (src && !hasError) {
      // Always create a blur placeholder first
      setBlurDataUrl(generateBlurDataUrl());
      
      // Create a tiny version of the image for blur effect
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Very small canvas for blur effect
          canvas.width = 10;
          canvas.height = 10;
          ctx.filter = 'blur(2px)';
          ctx.drawImage(img, 0, 0, 10, 10);
          setBlurDataUrl(canvas.toDataURL('image/jpeg', 0.1));
        }
      };
      img.onerror = () => {
        // Keep the simple gray placeholder
        setBlurDataUrl(generateBlurDataUrl());
      };
      img.src = src;
    } else if (!src || hasError) {
      // Set fallback blur for missing src or errors
      setBlurDataUrl(generateBlurDataUrl());
    }
  }, [src, hasError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Check if already in viewport on mount
    const rect = img.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight + 50; // 50px margin
    
    if (inViewport) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.unobserve(img);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(img);

    return () => observer.unobserve(img);
  }, [rootMargin, threshold]);

  // Handle image loading
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Determine which image to show
  const getImageSrc = () => {
    if (hasError) return fallback;
    if (!shouldLoad) {
      // Show blur placeholder when not in viewport
      return blurDataUrl || placeholder || '/lemore-logo.png';
    }
    return src;
  };

  const getImageStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      ...style,
      transition: 'opacity 300ms ease-out, filter 300ms ease-out',
    };

    if (!shouldLoad) {
      // Show blurred placeholder when not in viewport
      return {
        ...baseStyles,
        filter: 'blur(8px)',
        opacity: 0.7,
      };
    } else if (shouldLoad && isLoaded) {
      // Show sharp final image when loaded
      return {
        ...baseStyles,
        filter: 'blur(0px)',
        opacity: 1,
      };
    } else if (shouldLoad && !isLoaded) {
      // Loading actual image - slight blur during load
      return {
        ...baseStyles,
        filter: 'blur(2px)',
        opacity: 0.8,
      };
    }

    return baseStyles;
  };

  return (
    <div className="relative overflow-hidden" style={{ width: '100%', height: '100%' }}>
      <img
        ref={imgRef}
        src={getImageSrc()}
        alt={alt}
        className={className}
        style={getImageStyles()}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';