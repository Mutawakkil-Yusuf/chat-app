import { describe, expect, it } from 'vitest'
import { getInitials, hueFromId } from './format'

describe('getInitials', () => {
  it('takes the first letters of up to two words', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL')
    expect(getInitials('cher')).toBe('C')
  })

  it('falls back for empty input', () => {
    expect(getInitials(null)).toBe('?')
    expect(getInitials('   ')).toBe('?')
  })
})

describe('hueFromId', () => {
  it('is deterministic and within range', () => {
    const hue = hueFromId('user-123')
    expect(hue).toBe(hueFromId('user-123'))
    expect(hue).toBeGreaterThanOrEqual(0)
    expect(hue).toBeLessThan(360)
  })
})
