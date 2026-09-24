import { useCallback, useState } from 'react'
import { AppProvider } from './context/AppContext'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import type { Tab } from './components/BottomNav'
import type { Category, Item, ProfileId } from './types'
import { Today } from './pages/Today'
import { Closet } from './pages/Closet'
import { AddItem } from './pages/AddItem'
import { Gaps } from './pages/Gaps'
import { Setup } from './pages/Setup'
import { useApp } from './context/AppContext'

// You wear one bottom and one pair of shoes. Pinning a second of either is
// almost always a change of mind, so it replaces rather than stacking —
// unlike layers and accessories, which genuinely combine.
const SINGLE_SLOT: Category[] = ['Trousers', 'Skirt', 'Footwear']

function slotOf(item: Item): string | null {
  if (item.category === 'Trousers' || item.category === 'Skirt') return 'bottom'
  return SINGLE_SLOT.includes(item.category) ? item.category : null
}

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

function Shell() {
  const { profile, profileId } = useApp()
  // A profile with no aesthetic has never been through setup. Going straight to
  // Today would mean suggesting outfits for someone the model knows nothing
  // about, out of a closet with nothing in it.
  //
  // Tracked per profile rather than as a flag: skipping setup for one person
  // must not skip it for the next one created.
  const [skipped, setSkipped] = useState<ProfileId | null>(null)
  const needsSetup = !profile.aesthetic && skipped !== profileId
  const [tab, setTab] = useState<Tab>('today')
  // Pieces the user has decided on and wants built around. Held here so the
  // Closet can hand them to Today, which already owns weather and occasion.
  const [anchors, setAnchors] = useState<Item[]>([])

  const pinItem = useCallback((item: Item) => {
    setAnchors((prev) => {
      if (prev.some((a) => a.id === item.id)) return prev
      const slot = slotOf(item)
      const kept = slot ? prev.filter((a) => slotOf(a) !== slot) : prev
      return [...kept, item]
    })
    setTab('today')
  }, [])

  if (needsSetup) {
    return (
      <div className="flex min-h-svh flex-col bg-paper text-ink">
        <Header />
        <main className="flex flex-1 flex-col">
          <Setup onDone={() => setSkipped(profileId)} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-paper text-ink">
      <Header />
      <main className="flex flex-1 flex-col">
        {tab === 'today' && (
          <Today
            anchors={anchors}
            onRemoveAnchor={(id) => setAnchors((prev) => prev.filter((a) => a.id !== id))}
            onClearAnchors={() => setAnchors([])}
          />
        )}
        {tab === 'closet' && <Closet pinned={anchors} onBuildAround={pinItem} />}
        {tab === 'add' && <AddItem onAdded={() => setTab('closet')} />}
        {tab === 'gaps' && <Gaps />}
      </main>
      <BottomNav
        active={tab}
        onChange={(next) => {
          // Moving between Today and Closet is how pieces get added, so the
          // pins survive that. Anything else ends the session.
          if (next !== 'today' && next !== 'closet') setAnchors([])
          setTab(next)
        }}
      />
    </div>
  )
}

export default App
