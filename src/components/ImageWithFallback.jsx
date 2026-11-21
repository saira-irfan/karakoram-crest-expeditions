import { useState } from 'react';
import { FiImage } from 'react-icons/fi';

export default function ImageWithFallback({ src, alt, className, fallbackText = 'Expedition Photo' }) {
  const [hasError, setHasError] = useState(!src);

  if (hasError) {
    return (
      <div className={`img-fallback ${className || ''}`} role="img" aria-label={alt || fallbackText}>
        <FiImage className="fallback-icon" />
        <span className="fallback-label">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
