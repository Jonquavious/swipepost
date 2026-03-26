'use client'
import { useState, useEffect } from 'react'
import SwipeCard from '@/components/SwipeCard'
import AccountSelector from '@/components/AccountSelector'
import { getAccounts, getPendingContent, updateContentStatus } from '@/lib/supabase'

interface Account {
  id: string
  handle: string
  name: string
  pending?: number
}

interface Content {
  id: string
  account_id: string
  type: 'video' | 'image'
  media_url: string
  thumbnail_url?: string
  caption?: string
  location?: string
  source: string
  status: string
  restaurant_name?: string
  address?: string
  price_range?: string
  description?: string
}

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
  const [cards, setCards] = useState<Content[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    if (currentAccount) {
      loadContent(currentAccount.id)
    }
  }, [currentAccount])

  async function loadAccounts() {
    try {
      const data = await getAccounts()
      const mapped = data.map((a: any) => ({
        id: a.id,
        handle: a.handle,
        name: a.name || a.handle,
        pending: 0
      }))
      setAccounts(mapped)
      if (mapped.length > 0) setCurrentAccount(mapped[0])
    } catch (e) {
      console.error('Failed to load accounts:', e)
    } finally {
      setLoading(false)
    }
  }

  async function loadContent(accountId: string) {
    try {
      const data = await getPendingContent(accountId)
      setCards(data as Content[])
      setCurrentIndex(0)
    } catch (e) {
      console.error('Failed to load content:', e)
    }
  }

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    const card = cards[currentIndex]
    if (!card) return
    
    const statusMap = { right: 'approved', left: 'rejected', up: 'saved' }
    await updateContentStatus(card.id, statusMap[direction])
    setCurrentIndex(prev => prev + 1)
  }

  const currentCard = cards[currentIndex]
  const remaining = cards.length - currentIndex

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="animate-pulse">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-white">
      {/* Minimal Header */}
      <header className="shrink-0 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">SwipePost</h1>
          {remaining > 0 && (
            <p className="text-xs text-gray-500">{remaining} in queue</p>
          )}
        </div>
        {currentAccount && (
          <AccountSelector 
            accounts={accounts}
            current={currentAccount}
            onChange={setCurrentAccount}
          />
        )}
      </header>

      {/* Card area */}
      <div className="flex-1 flex items-start justify-center px-4 pt-2 pb-4 overflow-y-auto">
        {currentCard ? (
          <SwipeCard
            content={{
              id: currentCard.id,
              type: currentCard.type,
              url: currentCard.media_url,
              thumbnail: currentCard.thumbnail_url,
              caption: currentCard.caption || '',
              location: currentCard.location,
              source: currentCard.source,
              restaurant_name: currentCard.restaurant_name,
              address: currentCard.address,
              price_range: currentCard.price_range,
              description: currentCard.description,
              account_handle: currentAccount?.handle
            }}
            onSwipe={handleSwipe}
            isTop={true}
          />
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-5xl mb-4">✨</p>
            <p className="text-lg">All caught up!</p>
            <p className="text-sm mt-2 text-gray-600">No content to review</p>
          </div>
        )}
      </div>

      {/* Action buttons - sticky bottom */}
      <footer className="shrink-0 p-4 pb-8 flex justify-center gap-8 bg-gradient-to-t from-neutral-950 via-neutral-950">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-400 text-2xl active:scale-90 transition-all hover:bg-red-500/20 disabled:opacity-30 disabled:scale-100"
          disabled={!currentCard}
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe('up')}
          className="w-14 h-14 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-blue-400 text-xl active:scale-90 transition-all hover:bg-blue-500/20 disabled:opacity-30 disabled:scale-100"
          disabled={!currentCard}
        >
          ★
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center text-green-400 text-2xl active:scale-90 transition-all hover:bg-green-500/20 disabled:opacity-30 disabled:scale-100"
          disabled={!currentCard}
        >
          ✓
        </button>
      </footer>
    </main>
  )
}
