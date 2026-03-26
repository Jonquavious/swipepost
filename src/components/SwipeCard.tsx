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
  account_name?: string
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

  const accountHandle = content.account_handle || 'newyorkinpixels'

  return (
    <motion.div
      className="w-full max-w-sm rounded-3xl overflow-hidden bg-black shadow-2xl border border-gray-800"
      style={{ x, y, rotate }}
      animate={controls}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.01 }}
    >
      {/* Instagram-style Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-800">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold">
            {accountHandle[0].toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{accountHandle}</p>
          {content.location && (
            <p className="text-xs text-gray-400">{content.location}</p>
          )}
        </div>
        <div className="text-gray-500">•••</div>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-900">
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

        {/* Swipe indicators overlay */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-green-500/20"
          style={{ opacity: approveOpacity }}
        >
          <div className="px-6 py-3 bg-green-500 rounded-2xl font-bold text-2xl shadow-lg">
            ✓ POST IT
          </div>
        </motion.div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-red-500/20"
          style={{ opacity: rejectOpacity }}
        >
          <div className="px-6 py-3 bg-red-500 rounded-2xl font-bold text-2xl shadow-lg">
            ✕ SKIP
          </div>
        </motion.div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-blue-500/20"
          style={{ opacity: saveOpacity }}
        >
          <div className="px-6 py-3 bg-blue-500 rounded-2xl font-bold text-2xl shadow-lg">
            ★ SAVE
          </div>
        </motion.div>

        {content.type === 'video' && (
          <button 
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); setMuted(!muted) }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {/* Instagram-style Actions */}
      <div className="flex items-center gap-4 p-3">
        <span className="text-2xl">♡</span>
        <span className="text-2xl">💬</span>
        <span className="text-2xl">➤</span>
        <span className="ml-auto text-2xl">⊡</span>
      </div>

      {/* Caption Preview */}
      <div className="px-3 pb-4 space-y-2">
        {/* Restaurant name as bold opener */}
        {content.restaurant_name && (
          <p className="text-sm">
            <span className="font-bold">{accountHandle}</span>
            {' '}
            <span className="font-semibold">{content.restaurant_name}</span>
            {content.price_range && (
              <span className="text-green-400"> {content.price_range}</span>
            )}
          </p>
        )}
        
        {/* Main caption */}
        <p className="text-sm">
          <span className="font-bold">{accountHandle}</span>
          {' '}
          {content.caption}
        </p>

        {/* Description preview */}
        {content.description && (
          <p className="text-sm text-gray-300 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Address */}
        {content.address && (
          <p className="text-xs text-gray-400">
            📍 {content.address}
          </p>
        )}

        {/* Source badge */}
        <div className="flex items-center gap-2 pt-1">
          <span className="px-2 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400 uppercase tracking-wide">
            {content.source}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
