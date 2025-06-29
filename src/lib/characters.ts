export const characters = [
  {
    id: 'trump',
    name: 'Donald Trump',
    avatar: '🍊',
    description: 'Bold, confident, tremendous energy',
    accent: 'American',
    popular: true,
    koreanName: '도널드 트럼프',
    koreanDescription: '대담하고 자신감 넘치는 에너지'
  }
] as const

export type Character = typeof characters[number]
export type CharacterId = Character['id']