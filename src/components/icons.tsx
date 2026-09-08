type IconProps = { className?: string }

export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="4.2" />
      <path
        strokeLinecap="round"
        d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
      />
    </svg>
  )
}

export function HangerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.5a1.9 1.9 0 1 1 1.9 1.9c-.3 0-.6.16-.75.42l-.6 1.03 8.15 4.9c.6.36.35 1.28-.36 1.28H3.66c-.7 0-.96-.92-.36-1.28l8.15-4.9-.6-1.03a.9.9 0 0 1-.15-.42"
      />
      <path strokeLinecap="round" d="M5 18.6h14" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TargetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function LocationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-6.6 7-11.6A7 7 0 0 0 5 9.4C5 14.4 12 21 12 21Z"
      />
      <circle cx="12" cy="9.4" r="2.4" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 21.5 20h-19L12 3.5Z"
      />
      <path strokeLinecap="round" d="M12 9.5v4.2" />
      <circle cx="12" cy="16.8" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 18a4 4 0 0 1-.4-7.98 5 5 0 0 1 9.62-1.9A4.5 4.5 0 0 1 17.5 18h-11Z"
      />
    </svg>
  )
}

export function CloudSunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" d="M8.2 4.2v1.7M3.6 8.8h1.7M4.9 4.9l1.2 1.2" />
      <circle cx="8.2" cy="8.8" r="2.6" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.7 19.5a4 4 0 0 1-.4-7.97 5 5 0 0 1 9.62-1.9A4.5 4.5 0 0 1 19.7 19.5H8.7Z"
      />
    </svg>
  )
}

export function CloudFogIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 14.5a4 4 0 0 1-.3-7.98 5 5 0 0 1 9.62-1.9A4.5 4.5 0 0 1 17.5 13"
      />
      <path strokeLinecap="round" d="M4 17.5h16M6.5 20.5h11" />
    </svg>
  )
}

export function CloudRainIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 15a4 4 0 0 1-.4-7.98 5 5 0 0 1 9.62-1.9A4.5 4.5 0 0 1 17.5 15h-11Z"
      />
      <path strokeLinecap="round" d="M8.5 18v2.3M12 18v2.3M15.5 18v2.3" />
    </svg>
  )
}

export function CloudSnowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 15a4 4 0 0 1-.4-7.98 5 5 0 0 1 9.62-1.9A4.5 4.5 0 0 1 17.5 15h-11Z"
      />
      <path strokeLinecap="round" d="M8.5 18.2v.1M12 19v.1M15.5 18.2v.1M8.5 20.7v.1M15.5 20.7v.1" />
    </svg>
  )
}

export function CloudLightningIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 14a4 4 0 0 1-.4-7.98 5 5 0 0 1 9.62-1.9A4.5 4.5 0 0 1 17.5 14h-11Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 15.5 9.8 19.8h2.6l-1.6 3.5 4.4-5.4h-2.6l1.7-2.4Z" />
    </svg>
  )
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66M17.5 4v3.2h-3.2M6.5 20v-3.2h3.2"
      />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path strokeLinecap="round" d="m20 20-4.8-4.8" />
    </svg>
  )
}
