import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Gap, Item } from '../types'
import { TransferError, exportPayload, parseTransfer } from '../lib/closetTransfer'
import type { ParsedTransfer } from '../lib/closetTransfer'
import { AlertIcon, CloseIcon } from './icons'

type Mode = 'export' | 'import'

export function TransferModal({
  profileName,
  items,
  gaps,
  onClose,
  onImport,
}: {
  profileName: string
  items: Item[]
  gaps: Gap[]
  onClose: () => void
  onImport: (parsed: ParsedTransfer, mode: 'merge' | 'replace') => void
}) {
  const [mode, setMode] = useState<Mode>('export')

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink">Backup &amp; transfer</h3>
          <button type="button" onClick={onClose} className="text-ink-soft hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex rounded-full border border-line bg-card p-0.5">
          {(['export', 'import'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm capitalize transition-colors ${
                mode === m ? 'bg-ink font-medium text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === 'export' ? (
          <ExportPane profileName={profileName} items={items} gaps={gaps} />
        ) : (
          <ImportPane onImport={onImport} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

function ExportPane({
  profileName,
  items,
  gaps,
}: {
  profileName: string
  items: Item[]
  gaps: Gap[]
}) {
  const [copied, setCopied] = useState(false)
  const json = exportPayload(profileName, items, gaps)

  async function copy() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function download() {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fit-check-${profileName.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <p className="mb-3 text-sm text-ink-soft">
        {items.length} items and {gaps.length} gaps. Copy this to move {profileName}'s closet to
        another device, or keep it somewhere safe as a backup.
      </p>
      <textarea
        readOnly
        value={json}
        onFocus={(e) => e.currentTarget.select()}
        rows={6}
        className="w-full resize-none rounded-lg border border-line bg-card px-3 py-2 font-mono text-xs text-ink-soft outline-none"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          {copied ? 'Copied' : 'Copy to clipboard'}
        </button>
        <button
          type="button"
          onClick={download}
          className="rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft hover:text-ink"
        >
          Save file
        </button>
      </div>
    </div>
  )
}

function ImportPane({
  onImport,
  onClose,
}: {
  onImport: (parsed: ParsedTransfer, mode: 'merge' | 'replace') => void
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ParsedTransfer | null>(null)

  function check() {
    setError(null)
    try {
      setPreview(parseTransfer(text))
    } catch (err) {
      setPreview(null)
      setError(err instanceof TransferError ? err.message : 'Could not read that.')
    }
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setText(await file.text())
    setPreview(null)
    setError(null)
  }

  function run(mode: 'merge' | 'replace') {
    if (!preview) return
    if (
      mode === 'replace' &&
      !window.confirm('Replace the whole closet with this? Current items are discarded.')
    ) {
      return
    }
    onImport(preview, mode)
    onClose()
  }

  return (
    <div>
      <p className="mb-3 text-sm text-ink-soft">
        Paste a closet export, or JSON from anywhere else — item names and categories are enough.
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setPreview(null)
        }}
        rows={6}
        placeholder='{"items": [{"name": "Camel corduroy trouser", "category": "Trousers", "color": "camel"}]}'
        className="w-full resize-none rounded-lg border border-line bg-card px-3 py-2 font-mono text-xs text-ink outline-none focus:border-tobacco"
      />

      <div className="mt-2 flex items-center gap-3">
        <input type="file" accept=".json,application/json" onChange={handleFile} className="text-xs" />
      </div>

      {error && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-clay">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-3 rounded-lg border border-line bg-card p-3">
          <p className="text-sm font-medium text-ink">
            Found {preview.items.length} items and {preview.gaps.length} gaps.
          </p>
          {preview.warnings.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {preview.warnings.slice(0, 5).map((w, i) => (
                <li key={i} className="text-xs text-clay">
                  {w}
                </li>
              ))}
              {preview.warnings.length > 5 && (
                <li className="text-xs text-ink-soft">
                  …and {preview.warnings.length - 5} more skipped.
                </li>
              )}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => run('merge')}
              className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Add to closet
            </button>
            <button
              type="button"
              onClick={() => run('replace')}
              className="rounded-full border border-clay/30 px-4 py-2.5 text-sm text-clay hover:bg-clay-bg/40"
            >
              Replace all
            </button>
          </div>
        </div>
      )}

      {!preview && (
        <button
          type="button"
          onClick={check}
          disabled={!text.trim()}
          className="mt-3 w-full rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Check it
        </button>
      )}
    </div>
  )
}
