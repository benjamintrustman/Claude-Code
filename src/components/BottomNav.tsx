import type { ComponentType } from 'react'
import { HangerIcon, PlusIcon, SunIcon, TargetIcon } from './icons'

export type Tab = 'today' | 'closet' | 'add' | 'gaps'

const TABS: { id: Tab; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', Icon: SunIcon },
  { id: 'closet', label: 'Closet', Icon: HangerIcon },
  { id: 'add', label: 'Add', Icon: PlusIcon },
  { id: 'gaps', label: 'Gaps', Icon: TargetIcon },
]

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-paper/95 backdrop-blur-none pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                isActive ? 'text-tobacco-dark' : 'text-ink-soft'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-tobacco-dark' : 'text-ink-soft'}`} />
              <span className={isActive ? 'font-medium' : ''}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
