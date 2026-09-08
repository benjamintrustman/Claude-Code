import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import type { Tab } from './components/BottomNav'
import { Today } from './pages/Today'
import { Closet } from './pages/Closet'
import { AddItem } from './pages/AddItem'
import { Gaps } from './pages/Gaps'

function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <AppProvider>
      <div className="flex min-h-svh flex-col bg-paper text-ink">
        <Header />
        <main className="flex flex-1 flex-col">
          {tab === 'today' && <Today />}
          {tab === 'closet' && <Closet />}
          {tab === 'add' && <AddItem onAdded={() => setTab('closet')} />}
          {tab === 'gaps' && <Gaps />}
        </main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </AppProvider>
  )
}

export default App
