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
    saveChatHistory('user-1', {
      messages: [{ role: 'assistant', content: 'yo' }],
      pendingAction: null,
      createdWorkoutId: 'workout-123',
    })

    expect(loadChatHistory('user-1')).toEqual({
      messages: [{ role: 'assistant', content: 'yo' }],
      pendingAction: null,
      createdWorkoutId: 'workout-123',
    })
  })

  it('clears chat history', () => {
    saveChatHistory('user-1', {
      messages: [{ role: 'user', content: 'hi' }],
      pendingAction: null,
      createdWorkoutId: null,
    })

    clearChatHistory('user-1')

    expect(loadChatHistory('user-1')).toBeNull()
  })

  it('keeps different users isolated', () => {
    saveChatHistory('user-1', {
      messages: [{ role: 'assistant', content: 'first account' }],
      pendingAction: null,
      createdWorkoutId: null,
    })

    saveChatHistory('user-2', {
      messages: [{ role: 'assistant', content: 'second account' }],
      pendingAction: null,
      createdWorkoutId: null,
    })

    expect(loadChatHistory('user-1')?.messages[0]?.content).toBe('first account')
    expect(loadChatHistory('user-2')?.messages[0]?.content).toBe('second account')
  })
})
