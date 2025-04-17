import React, { useState } from 'react';
import { Skeleton } from './skeleton';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onLoadingComplete?: () => void;
  onLoadingError?: (error: Event) => void;
}

const SafeImage = ({
  src,
  alt,
  fallback = '/placeholder.svg',
  loadingComponent,
  errorComponent,
  className,
  onLoadingComplete,
  onLoadingError,
  ...props
}: SafeImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Generate a cache-busting URL to force reload
  const getCacheBustedSrc = (url?: string): string => {
    if (!url) return fallback;
    
    // Only add cache-busting for non-placeholder images
    if (url === fallback || url.includes('placeholder')) return url;
    
    // If URL already has a query string, append to it
    if (url.includes('?')) {
      return `${url}&t=${Date.now()}`;
    }
    
    // Otherwise, add a new query string
    return `${url}?t=${Date.now()}`;
  };

  // Handle image load completion
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(false);
    
    if (onLoadingComplete) {
      onLoadingComplete();
    }
  };

  // Handle image load error
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Image failed to load:', src);
    setHasError(true);
    setIsLoading(false);

    const target = e.target as HTMLImageElement;
    
    // Try to retry loading a limited number of times
    if (retryCount < 1 && src && src !== fallback) {
      // Try once more with cache-busting
      setRetryCount(prev => prev + 1);
      target.src = getCacheBustedSrc(src);
    } else {
      // After retries, use fallback
      target.src = fallback;
      
      if (onLoadingError) {
        onLoadingError(e.nativeEvent);
      }
    }
  };

  // Show loading component if loading
  if (isLoading && loadingComponent) {
    return (
      <div className={className} {...props}>
        {loadingComponent}
        <img
          src={src}
          alt={alt}
          className="hidden"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  // Show error component if error and provided
  if (hasError && errorComponent) {
    return (
      <div className={className} {...props}>
        {errorComponent}
      </div>
    );
  }

  // Default rendering
  return (
    <>
      {isLoading && !loadingComponent && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      <img
        src={src}
        alt={alt || 'Image'}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy" // Use lazy loading by default
        {...props}
      />
    </>
  );
};

export { SafeImage };
