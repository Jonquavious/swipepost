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
}

interface SwipeCardProps {
  content: CardContent
  onSwipe: (direction: 'left' | 'right' | 'up') => void
  isTop: boolean
}

export default function SwipeCard({ content, onSwipe, isTop }: SwipeCardProps) {
  const [muted, setMuted] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controls = useAnimation()
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-10, 10])

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

  return (
    <motion.div
      className="w-full max-w-xs h-full max-h-[65vh] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl relative"
      style={{ x, y, rotate }}
      animate={controls}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.01 }}
    >
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

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Swipe indicators */}
      <motion.div 
        className="absolute top-1/2 right-4 -translate-y-1/2 px-4 py-2 bg-green-500 rounded-xl font-bold text-lg shadow-lg"
        style={{ opacity: approveOpacity }}
      >
        ✓ POST
      </motion.div>
      <motion.div 
        className="absolute top-1/2 left-4 -translate-y-1/2 px-4 py-2 bg-red-500 rounded-xl font-bold text-lg shadow-lg"
        style={{ opacity: rejectOpacity }}
      >
        ✕ SKIP
      </motion.div>
      <motion.div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500 rounded-xl font-bold text-lg shadow-lg"
        style={{ opacity: saveOpacity }}
      >
        ★ SAVE
      </motion.div>

      {/* Content info */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Restaurant name & price */}
        {content.restaurant_name && (
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold">{content.restaurant_name}</h3>
            {content.price_range && (
              <span className="text-green-400 font-semibold">{content.price_range}</span>
            )}
          </div>
        )}
        
        {/* Caption */}
        <p className="text-base font-medium mb-2 text-gray-100">{content.caption}</p>
        
        {/* Location & address */}
        <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
          {content.address ? (
            <span>📍 {content.address}</span>
          ) : content.location && (
            <span>📍 {content.location}</span>
          )}
        </div>

        {/* Expanded description */}
        {expanded && content.description && (
          <p className="text-sm text-gray-400 mb-2 border-t border-gray-700 pt-2">
            {content.description}
          </p>
        )}

        {/* Source tag */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
            {content.source}
          </span>
          {content.description && (
            <span className="text-xs text-gray-500">
              {expanded ? '▲ less' : '▼ more'}
            </span>
          )}
        </div>
      </div>

      {content.type === 'video' && (
        <button 
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); setMuted(!muted) }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}
    </motion.div>
  )
}
