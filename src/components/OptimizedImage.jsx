import { useState } from 'react'
import { webpSrc, thumbSrc } from '../data/pages'

export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  width,
  height,
  loading = 'lazy',
  fetchPriority,
  objectPosition,
  sizes,
  useThumb = false,
  thumbWidth = 640,
  style,
  ...props
}) {
  const primary = useThumb ? thumbSrc(src, thumbWidth) : src
  const webp = useThumb ? primary : webpSrc(src)
  const [imgSrc, setImgSrc] = useState(primary)

  const handleError = () => {
    if (imgSrc !== src) setImgSrc(src)
  }

  const mergedStyle = objectPosition ? { objectPosition, ...style } : style

  if (webp && webp !== imgSrc && imgSrc === primary) {
    return (
      <picture className={className || undefined}>
        <source srcSet={webp} type="image/webp" sizes={sizes} />
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          sizes={sizes}
          style={mergedStyle}
          onError={handleError}
          {...props}
        />
      </picture>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes}
      style={mergedStyle}
      onError={handleError}
      {...props}
    />
  )
}
