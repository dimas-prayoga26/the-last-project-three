import type { SocialLink, SocialPlatform } from '@/types/api'

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  behance: 'Behance',
  pinterest: 'Pinterest',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  website: 'Website',
}

export function platformLabel(platform: SocialPlatform): string {
  return PLATFORM_LABELS[platform] ?? platform
}

/** A short handle for display, e.g. "@thelatestproject.id" or "example.com/laras". */
export function socialHandle(link: SocialLink): string {
  try {
    const url = new URL(link.url)
    const path = url.pathname.replace(/^\/+|\/+$/g, '')

    if (link.platform === 'website' || path === '') {
      return `${url.hostname.replace(/^www\./, '')}${path ? `/${path}` : ''}`
    }

    const last = path.split('/').pop() ?? path

    return last.startsWith('@') ? last : `@${last}`
  } catch {
    return link.url
  }
}

export function formatDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`))
}

export interface EventDateParts {
  day: string
  month: string
  year: string
  weekday: string
  /** "19.00–21.00", or just the start time when the event has no end on the same day. */
  time: string
  /** "14 November 2026", or a range for events over several days. */
  date: string
}

/**
 * Date parts for an event. The API sends the wall-clock time the admin entered
 * (stored in UTC), so it is formatted in UTC instead of the visitor's timezone.
 */
export function eventDateParts(startsAt: string, endsAt: string | null, locale: string): EventDateParts {
  const language = locale === 'id' ? 'id-ID' : 'en-GB'
  const start = new Date(startsAt)
  const end = endsAt ? new Date(endsAt) : null
  const part = (options: Intl.DateTimeFormatOptions, date = start): string =>
    new Intl.DateTimeFormat(language, { timeZone: 'UTC', ...options }).format(date)
  const longDate = (date: Date): string => part({ day: 'numeric', month: 'long', year: 'numeric' }, date)
  const time = (date: Date): string => part({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }, date).replace(':', '.')
  const sameDay = end !== null && longDate(start) === longDate(end)

  return {
    day: part({ day: 'numeric' }),
    month: part({ month: 'short' }).replace('.', ''),
    year: part({ year: 'numeric' }),
    weekday: part({ weekday: 'long' }),
    time: end && sameDay ? `${time(start)}–${time(end)}` : time(start),
    date: end && !sameDay ? `${longDate(start)} – ${longDate(end)}` : longDate(start),
  }
}

/** Splits long text into paragraphs on blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
