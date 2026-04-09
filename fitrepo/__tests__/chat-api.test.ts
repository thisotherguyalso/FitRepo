import { sendChatMessage } from '@/lib/api/chat'
import { supabase } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}))

describe('sendChatMessage', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key'

    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
        },
      },
      error: null,
    })

    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('returns the reply and workout id from the function response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: 'done',
        workout_id: 'workout-1',
      }),
    })

    const result = await sendChatMessage([{ role: 'user', content: 'make me a workout' }])

    expect(result).toEqual({
      reply: 'done',
      workoutId: 'workout-1',
      pendingAction: undefined,
    })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.supabase.co/functions/v1/chat',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
          apikey: 'anon-key',
        }),
      })
    )
  })

  it('surfaces the function error body when the response is not ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'Unauthorized.',
      }),
    })

    await expect(
      sendChatMessage([{ role: 'user', content: 'hey' }])
    ).rejects.toThrow('Unauthorized.')
  })
})
