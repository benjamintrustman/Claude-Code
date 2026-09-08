import { useState } from 'react'
import { ItemForm } from '../components/ItemForm'
import { useApp } from '../context/AppContext'

export function AddItem({ onAdded }: { onAdded?: () => void }) {
  const { addItem } = useApp()
  const [justAdded, setJustAdded] = useState(false)

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-5">
      <h2 className="mb-1 font-serif text-2xl font-semibold text-ink">Add item</h2>
      <p className="mb-5 text-sm text-ink-soft">Log a new piece into your closet.</p>

      {justAdded && (
        <div className="mb-4 rounded-lg border border-tobacco/30 bg-clay-bg/40 px-3 py-2 text-sm text-tobacco-dark">
          Added to your closet.
        </div>
      )}

      <ItemForm
        key={justAdded ? 'reset' : 'form'}
        submitLabel="Add to closet"
        onSubmit={(values) => {
          addItem(values)
          setJustAdded(true)
          onAdded?.()
          setTimeout(() => setJustAdded(false), 2000)
        }}
      />
    </div>
  )
}
