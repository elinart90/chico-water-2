import Image from 'next/image'
import { Product } from '@/types'

type ProductMediaProps = {
  product: Product
  className?: string
  sizes?: string
}

export default function ProductMedia({ product, className = '', sizes }: ProductMediaProps) {
  if (product.video_url) {
    return (
      <video
        src={product.video_url}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover object-center ${className}`}
        aria-label={product.name}
      />
    )
  }

  if (product.image_url) {
    return (
      <Image
        src={product.image_url}
        alt={product.name}
        fill
        className={`object-cover object-center ${className}`}
        sizes={sizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'}
      />
    )
  }

  return (
    <span className="text-5xl sm:text-6xl opacity-80">
      {product.category === 'bottled' ? '💧' : product.category === 'sachet' ? '🛍️' : '🫙'}
    </span>
  )
}
