'use client'
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface CardContent {
  id: string
  type: 'video' | 'image'
  url: string
  thumbnail?: string
  caption: string
  location?: string
  source: string
}

interface SwipeCardProps {
  content: CardContent
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

  const approveOpacity = useTransform(x, [0, 100], [0, 1])
  const rejectOpacity = useTransform(x, [-100, 0], [1, 0])
  const saveOpacity = useTransform(y, [-100, 0], [1, 0])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
      className="w-full max-w-xs h-full max-h-[60vh] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl"
      style={{ x, y, rotate, opacity }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <motion.div 
        className="absolute top-4 right-4 px-3 py-1 bg-green-500 rounded-lg font-bold text-sm"
        style={{ opacity: approveOpacity }}
      >
        APPROVE
      </motion.div>
      <motion.div 
        className="absolute top-4 left-4 px-3 py-1 bg-red-500 rounded-lg font-bold text-sm"
        style={{ opacity: rejectOpacity }}
      >
        SKIP
      </motion.div>
      <motion.div 
        className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-lg font-bold text-sm"
        style={{ opacity: saveOpacity }}
      >
        SAVE
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-base font-semibold mb-1">{content.caption}</p>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          {content.location && (
            <span>📍 {content.location}</span>
          )}
          <span className="px-2 py-0.5 bg-white/10 rounded-full">
            {content.source}
          </span>
        </div>
      </div>

      {content.type === 'video' && (
        <button 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-sm"
          onClick={() => setMuted(!muted)}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}
    </motion.div>
  )
}
