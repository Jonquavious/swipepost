'use client'
import { useState } from 'react'

interface Account {
  id: string
  name: string
  pending: number
}

interface AccountSelectorProps {
  accounts: Account[]
  current: Account
  onChange: (account: Account) => void
}

export default function AccountSelector({ accounts, current, onChange }: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
      >
        <span className="font-medium">{current.name}</span>
        {current.pending > 0 && (
          <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs">
            {current.pending}
          </span>
        )}
        <span className="text-gray-400">▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-800 shadow-xl z-20 overflow-hidden">
            {accounts.map(account => (
              <button
                key={account.id}
                onClick={() => {
                  onChange(account)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 ${
                  account.id === current.id ? 'bg-gray-700' : ''
                }`}
              >
                <span>{account.name}</span>
                {account.pending > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                    {account.pending}
                  </span>
                )}
              </button>
            ))}
            <div className="border-t border-gray-700">
              <button className="w-full px-4 py-3 text-left text-gray-400 hover:bg-gray-700">
                + Add account
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
