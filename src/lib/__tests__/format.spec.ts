import { describe, expect, it } from 'vitest'

import { eventDateParts, formatDate, paragraphs, socialHandle } from '@/lib/format'

describe('eventDateParts', () => {
  it('shows the entered wall-clock time and a same-day time range', () => {
    const parts = eventDateParts('2026-11-14T19:00:00+00:00', '2026-11-14T21:00:00+00:00', 'en')

    expect(parts).toMatchObject({ day: '14', month: 'Nov', year: '2026', weekday: 'Saturday', time: '19.00–21.00', date: '14 November 2026' })
  })

  it('writes a date range for events over several days, in Indonesian', () => {
    const parts = eventDateParts('2026-12-13T10:00:00+00:00', '2026-12-27T20:00:00+00:00', 'id')

    expect(parts.date).toBe('13 Desember 2026 – 27 Desember 2026')
    expect(parts.time).toBe('10.00')
    expect(parts.weekday).toBe('Minggu')
  })
})

describe('socialHandle', () => {
  it('turns a profile URL into an @handle', () => {
    expect(socialHandle({ platform: 'instagram', url: 'https://www.instagram.com/thelatestproject.id/' })).toBe('@thelatestproject.id')
    expect(socialHandle({ platform: 'tiktok', url: 'https://www.tiktok.com/@gilang.vm' })).toBe('@gilang.vm')
  })

  it('shows websites as host and path', () => {
    expect(socialHandle({ platform: 'website', url: 'https://www.example.com/laras' })).toBe('example.com/laras')
  })
})

describe('formatDate', () => {
  it('writes the month in the visitor language', () => {
    expect(formatDate('2026-03-02', 'en')).toBe('2 March 2026')
    expect(formatDate('2026-03-02', 'id')).toBe('2 Maret 2026')
  })
})

describe('paragraphs', () => {
  it('splits text on blank lines and drops empty parts', () => {
    expect(paragraphs('First.\n\nSecond line\nstill second.\n\n\n')).toEqual(['First.', 'Second line\nstill second.'])
    expect(paragraphs(null)).toEqual([])
  })
})
