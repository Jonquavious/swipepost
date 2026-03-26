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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      <header className="p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-bold">SwipePost</h1>
        {currentAccount && (
          <AccountSelector 
            accounts={accounts}
            current={currentAccount}
            onChange={setCurrentAccount}
          />
        )}
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        {currentCard ? (
          <SwipeCard
            content={{
              id: currentCard.id,
              type: currentCard.type,
              url: currentCard.media_url,
              thumbnail: currentCard.thumbnail_url,
              caption: currentCard.caption || '',
              location: currentCard.location,
              source: currentCard.source
            }}
            onSwipe={handleSwipe}
            isTop={true}
          />
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-4xl mb-4">✨</p>
            <p>All caught up!</p>
            <p className="text-sm mt-2">No content to review</p>
          </div>
        )}
      </div>

      <footer className="p-6 flex justify-center gap-8">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-2xl"
          disabled={!currentCard}
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe('up')}
          className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-xl"
          disabled={!currentCard}
        >
          ★
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-2xl"
          disabled={!currentCard}
        >
          ✓
        </button>
      </footer>
    </main>
  )
}
