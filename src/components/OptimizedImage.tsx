import type { ImgHTMLAttributes } from 'react';

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'decoding'> {
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
  loading: legacyLoading,
  decoding = 'async',
  fetchPriority,
  className,
  ...rest
}: OptimizedImageProps) => {
  const isPriority = priority || legacyLoading === 'eager';
  const loading = isPriority ? 'eager' : 'lazy';
  const priorityHint = fetchPriority ?? (isPriority ? 'high' : 'low');
  const sizeProps = width != null && height != null ? { width, height } : {};

  if (avifSrc || webpSrc) {
    return (
      <picture>
        {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={priorityHint}
          className={className}
          {...sizeProps}
          {...rest}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={priorityHint}
      className={className}
      {...sizeProps}
      {...rest}
    />
  );
};

export default OptimizedImage;
