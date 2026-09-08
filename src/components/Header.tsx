import { PROFILE_ORDER, PROFILES } from '../data/profiles'
import { useApp } from '../context/AppContext'

export function Header() {
  const { profileId, setProfileId } = useApp()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper px-4 py-3">
      <h1 className="font-serif text-xl font-semibold tracking-tight text-ink">Fit Check</h1>
      <div className="flex rounded-full border border-line bg-card p-0.5">
        {PROFILE_ORDER.map((id) => {
          const isActive = id === profileId
          return (
            <button
              key={id}
              type="button"
              onClick={() => setProfileId(id)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-ink text-paper font-medium'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {PROFILES[id].name}
            </button>
          )
        })}
      </div>
    </header>
  )
}
