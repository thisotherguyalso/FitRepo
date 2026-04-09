import { createClient } from 'jsr:@supabase/supabase-js@2'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    const model = Deno.env.get('OPENROUTER_MODEL') ?? 'openrouter/free'

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase function environment variables.')
    }

    if (!openRouterApiKey) {
      throw new Error('Missing OPENROUTER_API_KEY secret.')
    }

    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return json({ error: 'Missing Authorization header.' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { messages } = (await req.json()) as { messages?: ChatMessage[] }

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'messages must be a non-empty array.' }, { status: 400 })
    }

    const sanitizedMessages = messages
      .filter(
        (message) =>
          message &&
          typeof message.content === 'string' &&
          ['system', 'user', 'assistant'].includes(message.role)
      )
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }))
      .filter((message) => message.content.length > 0)

    if (sanitizedMessages.length === 0) {
      return json({ error: 'messages must include non-empty content.' }, { status: 400 })
    }

    const upstreamMessages =
      sanitizedMessages[0]?.role === 'system'
        ? sanitizedMessages
        : [
            {
              role: 'system',
              content:
                'You are the FitRepo assistant. Be concise and practical. Help with workouts, exercise substitutions, and app usage. Do not give medical advice.',
            },
            ...sanitizedMessages,
          ]

    const providerResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: upstreamMessages,
      }),
    })

    if (!providerResponse.ok) {
      const details = await providerResponse.text()

      return json(
        {
          error: 'Model provider request failed.',
          details,
        },
        { status: 502 }
      )
    }

    const completion = await providerResponse.json()
    const reply = completion?.choices?.[0]?.message?.content

    if (typeof reply !== 'string' || !reply.trim()) {
      return json({ error: 'Model provider returned no reply.' }, { status: 502 })
    }

    return json({ reply: reply.trim() })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return json({ error: message }, { status: 500 })
  }
})
