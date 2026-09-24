import { useState } from 'react'
import type { ProfileConfig } from '../types'
import { useApp } from '../context/AppContext'
import type { DraftItem, SetupAnswers } from '../lib/onboarding'
import { OnboardingError, buildProfileFromAnswers, dedupe, draftClosetFromText } from '../lib/onboarding'
import { AlertIcon } from '../components/icons'
import { DraftReview } from '../components/DraftReview'

const BLANK: SetupAnswers = { style: '', neverWear: '', fitNotes: '', colorNotes: '' }

export function Setup({ onDone }: { onDone: () => void }) {
  const { profile, closet, addItem, updateProfile } = useApp()
  const [stage, setStage] = useState<'style' | 'closet'>(profile.aesthetic ? 'closet' : 'style')
  const [answers, setAnswers] = useState<SetupAnswers>(BLANK)
  const [description, setDescription] = useState('')
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null)
  // Held rather than written. Saving the aesthetic at the end of stage one
  // would mark the profile set up and eject the user before the closet stage —
  // and an abandoned half-profile is worse than none.
  const [pending, setPending] = useState<Partial<ProfileConfig> | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof SetupAnswers, v: string) => setAnswers((p) => ({ ...p, [k]: v }))

  // The one place anything is persisted. Reached by finishing or by skipping
  // the closet — both keep the style answers, which are the harder half.
  const finish = () => {
    if (pending) updateProfile(pending)
    onDone()
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof OnboardingError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-5">
      <h2 className="mb-1 font-serif text-2xl font-semibold text-ink">
        {stage === 'style' ? `Let's set up ${profile.name}` : "Let's build your closet"}
      </h2>
      <p className="mb-5 text-sm text-ink-soft">
        {stage === 'style'
          ? 'Four questions. Say as much or as little as you like — anything left blank just means no rule.'
          : 'Describe what you own in your own words. It gets turned into a list you check before anything is saved.'}
      </p>

      {error && (
        <p className="mb-4 flex items-start gap-1.5 rounded-lg bg-clay-bg/50 px-3 py-2 text-sm text-clay">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {stage === 'style' && (
        <div className="flex flex-col gap-4">
          <Field
            label="How would you describe your style?"
            hint="Brands you like, a vibe, people you dress like — whatever comes to mind."
            value={answers.style}
            onChange={(v) => set('style', v)}
          />
          <Field
            label="Anything you never wear?"
            hint="Heels, shorts, logos, a colour you can't stand."
            value={answers.neverWear}
            onChange={(v) => set('neverWear', v)}
          />
          <Field
            label="Anything about fit or cut you care about?"
            hint="Used when judging something you're thinking of buying, not what you wear today."
            value={answers.fitNotes}
            onChange={(v) => set('fitNotes', v)}
          />
          <Field
            label="Anything about colour?"
            hint="Colours you live in, ones you avoid, or any colour vision worth knowing about."
            value={answers.colorNotes}
            onChange={(v) => set('colorNotes', v)}
          />
          <button
            type="button"
            disabled={busy || !answers.style.trim()}
            onClick={() =>
              run(async () => {
                setPending(await buildProfileFromAnswers(profile.name, answers))
                setStage('closet')
              })
            }
            className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? 'Working…' : 'Next — the closet'}
          </button>
        </div>
      )}

      {stage === 'closet' && drafts === null && (
        <div className="flex flex-col gap-3">
          <textarea
            rows={9}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              "Six pairs of jeans, three of them black and one light wash. A bunch of white tees and two grey ones. Brown Blundstones, white Sambas. A navy overshirt, a camel wool coat…"
            }
            className="w-full rounded-xl border border-line bg-card px-3.5 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-tobacco focus:outline-none"
          />
          <button
            type="button"
            disabled={busy || !description.trim()}
            onClick={() =>
              run(async () => {
                setDrafts(dedupe(await draftClosetFromText(description), closet))
              })
            }
            className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? 'Reading…' : 'Turn this into a closet'}
          </button>
          <button
            type="button"
            onClick={finish}
            className="text-center text-xs text-ink-soft underline decoration-line underline-offset-2 hover:text-ink"
          >
            Skip — I'll add things myself
          </button>
        </div>
      )}

      {drafts !== null && (
        <DraftReview
          drafts={drafts}
          onChange={setDrafts}
          saveLabel={(n) => `Save ${n} piece${n === 1 ? '' : 's'} to my closet`}
          backLabel="Back — describe it differently"
          onSave={() => {
            drafts.forEach((d) =>
              addItem({
                name: d.name,
                category: d.category,
                color: d.color,
                ...(d.note ? { note: d.note } : {}),
              }),
            )
            finish()
          }}
          onBack={() => setDrafts(null)}
        />
      )}
    </div>
  )
}

function Field({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <p className="mb-1.5 text-xs text-ink-soft">{hint}</p>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-tobacco focus:outline-none"
      />
    </div>
  )
}
