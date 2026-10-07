import { useState } from 'react'
import { clearStoredKey, keyWarning, loadStoredKey, maskKey, saveStoredKey } from '../lib/apiKey'
import { AlertIcon, CloseIcon } from './icons'

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const stored = loadStoredKey()
  const fromEnv = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY)
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)
  const warning = keyWarning(value)

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink">Anthropic API key</h3>
          <button type="button" onClick={onClose} className="shrink-0 text-ink-soft hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          This is what pays for outfit suggestions. Get one at{' '}
          <span className="text-ink">console.anthropic.com</span> under API Keys, then paste it
          below — it is stored in this browser only, and replacing it takes effect immediately with
          no restart.
        </p>

        <div className="mb-4 rounded-xl border border-line bg-card px-3.5 py-3 text-sm">
          <p className="mb-0.5 text-xs tracking-wide text-ink-soft uppercase">Currently using</p>
          {stored ? (
            <p className="font-mono text-ink">{maskKey(stored)}</p>
          ) : fromEnv ? (
            <p className="text-ink">
              The key from <span className="font-mono text-xs">.env</span>
            </p>
          ) : (
            <p className="text-clay">No key set — suggestions will not run</p>
          )}
        </div>

        <label className="mb-1 block text-sm font-medium text-ink">
          {stored ? 'Replace it' : 'Paste a key'}
        </label>
        <input
          type="password"
          value={value}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setValue(e.target.value)
            setSaved(false)
          }}
          placeholder="sk-ant-..."
          className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-soft/50 focus:border-tobacco focus:outline-none"
        />

        {warning && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-clay">
            <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {warning}
          </p>
        )}
        {saved && <p className="mt-2 text-xs text-tobacco-dark">Saved. It is in use now.</p>}

        <button
          type="button"
          disabled={!value.trim()}
          onClick={() => {
            saveStoredKey(value)
            setValue('')
            setSaved(true)
          }}
          className="mt-3 w-full rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Save key
        </button>

        {stored && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  fromEnv
                    ? 'Remove the saved key? The app will fall back to the one in .env.'
                    : 'Remove the saved key? Outfit suggestions will stop working until you add another.',
                )
              ) {
                clearStoredKey()
                setSaved(false)
                onClose()
              }
            }}
            className="mt-2.5 w-full rounded-full border border-clay/30 px-4 py-2.5 text-sm text-clay hover:bg-clay-bg/40"
          >
            Remove saved key
          </button>
        )}

        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          Stored in this browser, so each device needs its own. It is as exposed here as it is in a
          front-end build — fine on your own machine, which is why a hosted version needs a server
          holding the key instead.
        </p>
      </div>
    </div>
  )
}
