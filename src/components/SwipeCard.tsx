'use client'
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'

interface CardContent {
  id: string
  type: 'video' | 'image'
  url: string
  thumbnail?: string
  caption: string
  location?: string
  source: string
  restaurant_name?: string
  address?: string
  price_range?: string
  description?: string
  account_handle?: string
}

interface SwipeCardProps {
  content: CardContent
  onSwipe: (direction: 'left' | 'right' | 'up') => void
  isTop: boolean
}

export default function SwipeCard({ content, onSwipe, isTop }: SwipeCardProps) {
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controls = useAnimation()
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-8, 8])

  const approveOpacity = useTransform(x, [0, 150], [0, 1])
  const rejectOpacity = useTransform(x, [-150, 0], [1, 0])
  const saveOpacity = useTransform(y, [-150, 0], [1, 0])

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 150
    const velocity = 500
    
    if (info.offset.y < -swipeThreshold || info.velocity.y < -velocity) {
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('up')
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocity) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('right')
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocity) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('left')
    } else {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300 } })
    }
  }

  const handle = content.account_handle || 'account'

  return (
    <motion.div
      className="w-full max-w-[320px] h-full max-h-full flex flex-col rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl border border-gray-800"
      style={{ x, y, rotate }}
      animate={controls}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
    >
      {/* IG Header - compact */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-gray-800">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
          <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold">
            {handle[0].toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs truncate">{handle}</p>
          {content.location && (
            <p className="text-[10px] text-gray-500 truncate">{content.location}</p>
          )}
        </div>
      </div>

      {/* Image - flexible, square-ish */}
      <div className="flex-1 relative bg-black min-h-0">
        {content.type === 'video' ? (
          <video
            ref={videoRef}
            src={content.url}
            poster={content.thumbnail}
            autoPlay
            muted={muted}
            loop
            playsInline
            className="w-full h-full object-cover"
            onClick={() => setMuted(!muted)}
          />
        ) : (
          <img 
            src={content.url} 
            alt={content.caption}
            className="w-full h-full object-cover"
          />
        )}

        {/* Swipe overlays */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-green-500/30 backdrop-blur-sm"
          style={{ opacity: approveOpacity }}
        >
          <div className="px-5 py-2 bg-green-500 rounded-xl font-bold text-xl">✓ POST</div>
        </motion.div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-red-500/30 backdrop-blur-sm"
          style={{ opacity: rejectOpacity }}
        >
          <div className="px-5 py-2 bg-red-500 rounded-xl font-bold text-xl">✕ SKIP</div>
        </motion.div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-blue-500/30 backdrop-blur-sm"
          style={{ opacity: saveOpacity }}
        >
          <div className="px-5 py-2 bg-blue-500 rounded-xl font-bold text-xl">★ SAVE</div>
        </motion.div>

        {content.type === 'video' && (
          <button 
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-sm"
            onClick={(e) => { e.stopPropagation(); setMuted(!muted) }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {/* Caption area - compact */}
      <div className="shrink-0 px-3 py-2 space-y-1 border-t border-gray-800 max-h-[120px] overflow-y-auto">
        {/* Restaurant + price */}
        {content.restaurant_name && (
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">{content.restaurant_name}</span>
            {content.price_range && (
              <span className="text-green-400 text-xs font-medium">{content.price_range}</span>
            )}
          </div>
        )}
        
        {/* Caption */}
        <p className="text-xs">
          <span className="font-semibold">{handle}</span>{' '}
          <span className="text-gray-300">{content.caption}</span>
        </p>

        {/* Address */}
        {content.address && (
          <p className="text-[10px] text-gray-500">📍 {content.address}</p>
        )}

        {/* Description if exists */}
        {content.description && (
          <p className="text-[10px] text-gray-400 line-clamp-2">{content.description}</p>
        )}
      </div>
    </motion.div>
  )
}
