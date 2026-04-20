import { supabase } from '@/lib/supabase'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type PendingWorkoutEdit = {
  kind: 'edit_workout'
  workout_id: string
  workout_name: string
  performed_at: string
  message: string
  exercises: {
    exercise_name: string
    sets: {
      reps: number | null
      time_seconds: number | null
      weight: number | null
    }[]
  }[]
}

type ChatFunctionResponse = {
  reply?: string
  workout_id?: string
  pending_action?: PendingWorkoutEdit
  error?: string
  details?: string
}

export type ChatResult = {
  reply: string
  workoutId?: string
  pendingAction?: PendingWorkoutEdit
}

type SendChatMessageOptions = {
  pendingAction?: PendingWorkoutEdit | null
  confirmation?: 'yes' | 'no'
}

export function normalizeReply(reply: string) {
  const trimmed = reply.trim()

  for (const candidate of [trimmed, trimmed.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1').trim()]) {
    try {
      let parsed: unknown = candidate

      // some providers send json, some send stringified json, and some send stringified json inside code fences.
      // yeah, it's annoying.
      for (let depth = 0; depth < 3 && typeof parsed === 'string'; depth += 1) {
        parsed = JSON.parse(parsed)
      }

      if (parsed && typeof parsed === 'object') {
        if ('message' in parsed && typeof parsed.message === 'string') {
          return parsed.message.trim()
        }

        if ('reply' in parsed && typeof parsed.reply === 'string') {
          return parsed.reply.trim()
        }
      }
    } catch {
      // leave the raw reply alone if it is not valid JSON
    }
  }

  const embeddedJsonMatch = trimmed.match(/\{[\s\S]*\}/)
  if (embeddedJsonMatch) {
    try {
      const parsed = JSON.parse(embeddedJsonMatch[0]) as { message?: string; reply?: string }

      if (typeof parsed.message === 'string') {
        return parsed.message.trim()
      }

      if (typeof parsed.reply === 'string') {
        return parsed.reply.trim()
      }
    } catch {
      // this one's usually junk wrapped around a non-json message, so just fall through
    }
  }

  return trimmed
}

export async function sendChatMessage(
  messages: ChatMessage[],
  options: SendChatMessageOptions = {}
) {
  // get the current session so we can send the user's token straight to the edge function
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  // edge function needs a real signed-in user, not just local chat state
  if (!session?.access_token) {
    throw new Error('You must be logged in to use chat.')
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL.')
  }

  // direct fetch here on purpose cause supabase.functions.invoke was eating the useful error body
  const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseAnonKey) {
    throw new Error('Missing Supabase publishable key in app env.')
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      messages,
      pending_action: options.pendingAction ?? null,
      confirmation: options.confirmation ?? null,
    }),
  })

  const data = (await response.json().catch(() => ({}))) as ChatFunctionResponse

  // bubble up the actual function error instead of the generic non-2xx nonsense
  if (!response.ok) {
    if (data.error && data.details) {
      throw new Error(`${data.error}\n${data.details}`)
    }

    if (data.error) {
      throw new Error(data.error)
    }

    throw new Error(`Chat request failed with status ${response.status}.`)
  }

  if (!data.reply) {
    throw new Error('Chat function returned an empty response.')
  }

  return {
    reply: normalizeReply(data.reply),
    workoutId: data.workout_id,
    pendingAction: data.pending_action,
  } satisfies ChatResult
}
