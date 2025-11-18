import { describe, it, expect } from 'vitest'
import { characters } from '../characters'

describe('characters', () => {
  it('should have at least one character', () => {
    expect(characters.length).toBeGreaterThan(0)
  })

  it('should have valid character structure', () => {
    characters.forEach(character => {
      expect(character).toHaveProperty('id')
      expect(character).toHaveProperty('name')
      expect(character).toHaveProperty('avatar')
      expect(character).toHaveProperty('description')
      expect(character).toHaveProperty('accent')
      expect(character).toHaveProperty('popular')
      expect(character).toHaveProperty('koreanName')
      expect(character).toHaveProperty('koreanDescription')
    })
  })

  it('should have unique character ids', () => {
    const ids = characters.map(c => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have non-empty string fields', () => {
    characters.forEach(character => {
      expect(character.id).toBeTruthy()
      expect(character.name).toBeTruthy()
      expect(character.avatar).toBeTruthy()
      expect(character.description).toBeTruthy()
      expect(character.accent).toBeTruthy()
      expect(character.koreanName).toBeTruthy()
      expect(character.koreanDescription).toBeTruthy()
    })
  })

  it('should have boolean popular field', () => {
    characters.forEach(character => {
      expect(typeof character.popular).toBe('boolean')
    })
  })

  it('should have Trump character', () => {
    const trump = characters.find(c => c.id === 'trump')
    expect(trump).toBeDefined()
    expect(trump?.name).toBe('Donald Trump')
    expect(trump?.koreanName).toBe('도널드 트럼프')
    expect(trump?.avatar).toBe('🍊')
    expect(trump?.accent).toBe('American')
  })
})
