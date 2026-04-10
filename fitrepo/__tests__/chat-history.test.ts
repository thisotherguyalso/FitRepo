import {
  clearChatHistory,
  loadChatHistory,
  saveChatHistory,
} from '@/lib/chat-history'

describe('chat history storage', () => {
  beforeEach(() => {
    const store = new Map<string, string>()

    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => store.get(key) ?? null),
        setItem: jest.fn((key: string, value: string) => {
          store.set(key, value)
        }),
        removeItem: jest.fn((key: string) => {
          store.delete(key)
        }),
      },
      configurable: true,
    })
  })

  it('saves and loads chat history', () => {
    saveChatHistory({
      messages: [{ role: 'assistant', content: 'yo' }],
      pendingAction: null,
      createdWorkoutId: 'workout-123',
    })

    expect(loadChatHistory()).toEqual({
      messages: [{ role: 'assistant', content: 'yo' }],
      pendingAction: null,
      createdWorkoutId: 'workout-123',
    })
  })

  it('clears chat history', () => {
    saveChatHistory({
      messages: [{ role: 'user', content: 'hi' }],
      pendingAction: null,
      createdWorkoutId: null,
    })

    clearChatHistory()

    expect(loadChatHistory()).toBeNull()
  })
})
