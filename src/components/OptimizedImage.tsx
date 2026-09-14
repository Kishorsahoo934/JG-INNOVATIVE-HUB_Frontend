import type { ImgHTMLAttributes } from 'react';
import { PLACEHOLDER_IMAGE } from '@/constants/media';

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  /** Image URL (required) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Use for above-the-fold LCP/critical images (e.g. hero, header logo). Default: false */
  priority?: boolean;
  /** Optional WebP source for modern formats (use when you have a .webp version) */
  webpSrc?: string;
  /** Optional AVIF source (use when you have .avif version) */
  avifSrc?: string;
  /** Width in px (recommended for LCP/CLS); use with height */
  width?: number;
  /** Height in px (recommended for LCP/CLS); use with width */
  height?: number;
  /** Fallback image URL when source fails to load */
  fallbackSrc?: string;
  /** @deprecated use priority instead */
  loading?: 'lazy' | 'eager';
}

/**
 * Performance-optimized image: lazy loading, async decoding, optional WebP/AVIF.
 * Use priority=true only for LCP/critical images (e.g. hero, header logo).
 */
const OptimizedImage = ({
  src,
  alt,
  priority = false,
  webpSrc,
  avifSrc,
  width,
  height,
  fallbackSrc = PLACEHOLDER_IMAGE,
  loading: legacyLoading,
  decoding = 'async',
  fetchPriority,
  className,
  onError,
  ...rest
}: OptimizedImageProps) => {
  const isPriority = priority || legacyLoading === 'eager';
  const loading = isPriority ? 'eager' : 'lazy';
  const priorityHint = fetchPriority ?? (isPriority ? 'high' : 'low');
  const sizeProps = width != null && height != null ? { width, height } : {};

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== fallbackSrc && !target.src.endsWith(fallbackSrc)) {
      target.onerror = null;
      target.src = fallbackSrc;
    }
    if (onError) onError(e);
  };

  if (avifSrc || webpSrc) {
    return (
      <picture>
        {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img
          src={src || fallbackSrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchpriority={priorityHint as 'high' | 'low' | 'auto'}
          className={className}
          onError={handleImageError}
          {...sizeProps}
          {...rest}
        />
      </picture>
    );
  }

  return (
    <img
      src={src || fallbackSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchpriority={priorityHint as 'high' | 'low' | 'auto'}
      className={className}
      onError={handleImageError}
      {...sizeProps}
      {...rest}
    />
  );
};

export default OptimizedImage;
