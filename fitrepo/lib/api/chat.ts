import { supabase } from '@/lib/supabase'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type ChatFunctionResponse = {
  reply: string
}

export async function sendChatMessage(messages: ChatMessage[]) {
  const { data, error } = await supabase.functions.invoke<ChatFunctionResponse>('chat', {
    body: { messages },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data?.reply) {
    throw new Error('Chat function returned an empty response.')
  }

  return data.reply
}
