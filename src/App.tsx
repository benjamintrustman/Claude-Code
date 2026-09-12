import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import type { Tab } from './components/BottomNav'
import type { Item } from './types'
import { Today } from './pages/Today'
import { Closet } from './pages/Closet'
import { AddItem } from './pages/AddItem'
import { Gaps } from './pages/Gaps'

function App() {
  const [tab, setTab] = useState<Tab>('today')
  // A piece the user picked from the Closet to build around. Held here so
  // Closet can hand it to Today, which already owns weather and occasion.
  const [anchor, setAnchor] = useState<Item | null>(null)

  return (
    <AppProvider>
      <div className="flex min-h-svh flex-col bg-paper text-ink">
        <Header />
        <main className="flex flex-1 flex-col">
          {tab === 'today' && <Today anchor={anchor} onClearAnchor={() => setAnchor(null)} />}
          {tab === 'closet' && (
            <Closet
              onBuildAround={(item) => {
                setAnchor(item)
                setTab('today')
              }}
            />
          )}
          {tab === 'add' && <AddItem onAdded={() => setTab('closet')} />}
          {tab === 'gaps' && <Gaps />}
        </main>
        <BottomNav
          active={tab}
          onChange={(next) => {
            // Leaving Today drops the anchor, so it can't quietly persist
            // into a later, unrelated request.
            if (next !== 'today') setAnchor(null)
            setTab(next)
          }}
        />
      </div>
    </AppProvider>
  )
}

export default App
