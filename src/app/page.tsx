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
      <main className="h-[100dvh] flex items-center justify-center bg-neutral-950 text-white">
        <div className="animate-pulse">Loading...</div>
      </main>
    )
  }

  return (
    <main className="h-[100dvh] flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-4 py-2 flex justify-between items-center border-b border-gray-800/50">
        <div>
          <h1 className="text-lg font-bold tracking-tight">SwipePost</h1>
          {remaining > 0 && (
            <p className="text-[10px] text-gray-500">{remaining} in queue</p>
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

      {/* Card area - takes available space */}
      <div className="flex-1 flex items-center justify-center p-3 min-h-0">
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
          <div className="text-center text-gray-500">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-base">All caught up!</p>
            <p className="text-xs mt-1 text-gray-600">No content to review</p>
          </div>
        )}
      </div>

      {/* Action buttons - always visible */}
      <footer className="shrink-0 py-3 pb-6 flex justify-center gap-6 border-t border-gray-800/50">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center text-red-400 text-xl active:scale-90 transition-all"
          disabled={!currentCard}
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe('up')}
          className="w-12 h-12 rounded-full bg-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 text-lg active:scale-90 transition-all"
          disabled={!currentCard}
        >
          ★
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center text-green-400 text-xl active:scale-90 transition-all"
          disabled={!currentCard}
        >
          ✓
        </button>
      </footer>
    </main>
  )
}
