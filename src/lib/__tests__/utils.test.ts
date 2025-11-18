import { describe, it, expect } from 'vitest'
import { parseReactionsFromScript } from '../utils'

describe('parseReactionsFromScript', () => {
  it('should parse reactions from a valid script', () => {
    const script = `
Some other content here
--- Character Reactions ---
Trump: "This is tremendous, absolutely tremendous!"
Biden: "Come on, man! This is serious."
Obama: "Let me be clear, this is important."
`
    const reactions = parseReactionsFromScript(script)

    expect(reactions).toHaveLength(3)
    expect(reactions[0]).toBe('This is tremendous, absolutely tremendous!')
    expect(reactions[1]).toBe('Come on, man! This is serious.')
    expect(reactions[2]).toBe('Let me be clear, this is important.')
  })

  it('should return empty array when no reaction section exists', () => {
    const script = `
Just some random content
without any reactions
`
    const reactions = parseReactionsFromScript(script)

    expect(reactions).toEqual([])
  })

  it('should handle empty reaction section', () => {
    const script = `
Some content
--- Character Reactions ---

`
    const reactions = parseReactionsFromScript(script)

    expect(reactions).toEqual([])
  })

  it('should filter out empty lines', () => {
    const script = `
Content
--- Character Reactions ---
Trump: "Great!"

Biden: "Good!"

`
    const reactions = parseReactionsFromScript(script)

    expect(reactions).toHaveLength(2)
    expect(reactions[0]).toBe('Great!')
    expect(reactions[1]).toBe('Good!')
  })

  it('should handle reactions without quotes', () => {
    const script = `
Content
--- Character Reactions ---
Trump: Great stuff
Biden: Amazing
`
    const reactions = parseReactionsFromScript(script)

    expect(reactions.length).toBeGreaterThan(0)
  })

  it('should trim whitespace from reactions', () => {
    const script = `
Content
--- Character Reactions ---
Trump: "  Lots of spaces  "
Biden: "  More spaces  "
`
    const reactions = parseReactionsFromScript(script)

    expect(reactions[0]).toBe('Lots of spaces')
    expect(reactions[1]).toBe('More spaces')
  })
})
