'use client'
import { useState } from 'react'
import SwipeCard from '@/components/SwipeCard'
import AccountSelector from '@/components/AccountSelector'

// Mock data - will come from Supabase
const mockContent = [
  {
    id: '1',
    type: 'video',
    url: '/sample1.mp4',
    thumbnail: '/thumb1.jpg',
    caption: "NYC's best kept secret 👀",
    location: 'Jackson Heights',
    source: 'AI Generated',
    account: 'newyorkinpixels'
  },
  {
    id: '2', 
    type: 'video',
    url: '/sample2.mp4',
    thumbnail: '/thumb2.jpg',
    caption: '$8 for THIS in Manhattan??',
    location: 'Chinatown',
    source: 'AI Generated',
    account: 'newyorkinpixels'
  },
  {
    id: '3',
    type: 'image',
    url: '/pizza1.jpg',
    caption: 'The cheese pull of your dreams 🍕',
    location: 'Brooklyn',
    source: 'UGC Submission',
    account: 'greatestpizzas'
  }
]

const accounts = [
  { id: 'newyorkinpixels', name: '@NewYorkInPixels', pending: 12 },
  { id: 'greatestpizzas', name: '@greatestpizzas', pending: 5 },
  { id: 'voyagelane', name: '@Voyagelane', pending: 3 },
]

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(accounts[0])
  const [cards, setCards] = useState(mockContent)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    const card = cards[currentIndex]
    
    if (direction === 'right') {
      console.log('APPROVED:', card.id)
      // TODO: Add to approved queue in Supabase
    } else if (direction === 'left') {
      console.log('REJECTED:', card.id)
      // TODO: Mark as rejected in Supabase
    } else if (direction === 'up') {
      console.log('SAVED FOR LATER:', card.id)
      // TODO: Add to saved queue
    }
    
    setCurrentIndex(prev => prev + 1)
  }

  const currentCard = cards[currentIndex]
  const nextCard = cards[currentIndex + 1]

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-bold">SwipePost</h1>
        <AccountSelector 
          accounts={accounts}
          current={currentAccount}
          onChange={setCurrentAccount}
        />
      </header>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-4 card-stack">
        {currentCard ? (
          <SwipeCard
            content={currentCard}
            onSwipe={handleSwipe}
            isTop={true}
          />
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-4xl mb-4">✨</p>
            <p>All caught up!</p>
            <p className="text-sm mt-2">No more content to review</p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <footer className="p-6 flex justify-center gap-8">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-2xl"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe('up')}
          className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-xl"
        >
          ★
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-2xl"
        >
          ✓
        </button>
      </footer>
    </main>
  )
}
