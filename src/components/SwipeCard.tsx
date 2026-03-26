'use client'
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface Content {
  id: string
  type: 'video' | 'image'
  url: string
  thumbnail?: string
  caption: string
  location?: string
  source: string
  account: string
}

interface SwipeCardProps {
  content: Content
  onSwipe: (direction: 'left' | 'right' | 'up') => void
  isTop: boolean
}

export default function SwipeCard({ content, onSwipe, isTop }: SwipeCardProps) {
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Swipe indicators
  const approveOpacity = useTransform(x, [0, 100], [0, 1])
  const rejectOpacity = useTransform(x, [-100, 0], [1, 0])
  const saveOpacity = useTransform(y, [-100, 0], [1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100
    
    if (info.offset.y < -swipeThreshold) {
      onSwipe('up')
    } else if (info.offset.x > swipeThreshold) {
      onSwipe('right')
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('left')
    }
  }

  return (
    <motion.div
      className="swipe-card absolute w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl"
      style={{ x, y, rotate, opacity }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      {/* Media */}
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

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Swipe indicators */}
      <motion.div 
        className="absolute top-8 right-8 px-4 py-2 bg-green-500 rounded-lg font-bold text-xl"
        style={{ opacity: approveOpacity }}
      >
        APPROVE
      </motion.div>
      <motion.div 
        className="absolute top-8 left-8 px-4 py-2 bg-red-500 rounded-lg font-bold text-xl"
        style={{ opacity: rejectOpacity }}
      >
        SKIP
      </motion.div>
      <motion.div 
        className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500 rounded-lg font-bold text-xl"
        style={{ opacity: saveOpacity }}
      >
        SAVE
      </motion.div>

      {/* Content info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-lg font-semibold mb-1">{content.caption}</p>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          {content.location && (
            <span className="flex items-center gap-1">
              📍 {content.location}
            </span>
          )}
          <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
            {content.source}
          </span>
        </div>
      </div>

      {/* Mute indicator */}
      {content.type === 'video' && (
        <button 
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
          onClick={() => setMuted(!muted)}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}
    </motion.div>
  )
}
