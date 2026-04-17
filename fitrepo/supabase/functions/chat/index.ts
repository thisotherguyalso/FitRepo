import { createClient } from 'jsr:@supabase/supabase-js@2'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type ExerciseRow = {
  id: string
  name: string
  type: 'timed' | 'reps'
}

type WorkoutRow = {
  id: string
  name: string
  performed_at: string
  is_finished: boolean
}

type ProfileRow = {
  username?: string | null
  goal?: string | null
  current_streak?: number | null
  height_cm?: number | null
  body_weight_kg?: number | null
}

type WorkoutPlanExercise = {
  exercise_name: string
  sets: Array<{
    reps: number | null
    time_seconds: number | null
    weight: number | null
  }>
}

type PendingWorkoutEdit = {
  kind: 'edit_workout'
  workout_id: string
  workout_name: string
  performed_at: string
  message: string
  exercises: WorkoutPlanExercise[]
}

type ModelAction =
  | {
      type: 'reply'
      message: string
    }
  | {
      type: 'create_workout'
      message: string
      workout_name: string
      performed_at: string
      exercises: WorkoutPlanExercise[]
    }
  | {
      type: 'edit_workout'
      message: string
      workout_name: string
      performed_at: string
      exercises: WorkoutPlanExercise[]
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

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function stripCodeFence(content: string) {
  const match = content.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return match ? match[1].trim() : content.trim()
}

function parseJsonValue(content: string): unknown | null {
  let current: unknown = content.trim()

  for (let depth = 0; depth < 3 && typeof current === 'string'; depth += 1) {
    try {
      current = JSON.parse(current)
    } catch {
      return null
    }
  }

  return current
}

function toModelAction(value: unknown): ModelAction | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const candidate = value as Record<string, unknown>

  if (candidate.type === 'reply' && typeof candidate.message === 'string') {
    return {
      type: 'reply',
      message: candidate.message,
    }
  }

  if (
    (candidate.type === 'create_workout' || candidate.type === 'edit_workout') &&
    typeof candidate.message === 'string' &&
    typeof candidate.workout_name === 'string' &&
    typeof candidate.performed_at === 'string' &&
    Array.isArray(candidate.exercises)
  ) {
    return {
      type: candidate.type,
      message: candidate.message,
      workout_name: candidate.workout_name,
      performed_at: candidate.performed_at,
      exercises: candidate.exercises as WorkoutPlanExercise[],
    }
  }

  return null
}

function parseModelAction(content: string): ModelAction | null {
  const normalizedContent = stripCodeFence(content)
  const directMatch = toModelAction(parseJsonValue(normalizedContent))

  if (directMatch) {
    return directMatch
  }

  try {
    return toModelAction(JSON.parse(content))
  } catch {
    const match = normalizedContent.match(/\{[\s\S]*\}/)
    if (!match) return null

    return toModelAction(parseJsonValue(match[0]))
  }
}

function extractTextFromContent(content: unknown): string {
  // openrouter can return plain strings or content-part arrays depending on the model
  // ref: https://openrouter.ai/docs/api-reference/chat-completion
  if (typeof content === 'string') {
    return content.trim()
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
        return part.text
      }

      return ''
    })
    .join('\n')
    .trim()
}

function buildExerciseCatalog(exercises: ExerciseRow[]) {
  return exercises.map((exercise) => ({
    name: exercise.name,
    type: exercise.type,
  }))
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function parseRequestedDate(value: string | null | undefined) {
  const raw = value?.trim()

  if (!raw) return getTodayDate()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const normalized = normalizeName(raw)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (normalized === 'today') return toIsoDate(today)
  if (normalized === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return toIsoDate(tomorrow)
  }
  if (normalized === 'yesterday') {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return toIsoDate(yesterday)
  }

  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const weekdayMatch = normalized.match(/^(next )?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/)

  if (weekdayMatch) {
    const isNext = Boolean(weekdayMatch[1])
    const targetDay = weekdays.indexOf(weekdayMatch[2])
    const currentDay = today.getDay()
    let diff = (targetDay - currentDay + 7) % 7

    // if they say "monday" on a monday, assume they mean the next one
    if (diff === 0 || isNext) {
      diff += 7
    }

    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() + diff)
    return toIsoDate(targetDate)
  }

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    parsed.setHours(0, 0, 0, 0)
    return toIsoDate(parsed)
  }

  // fallback to today if the model gives us some weird date phrase
  return getTodayDate()
}

function toNullableNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function sanitizeWorkoutExercises(
  exercises: WorkoutPlanExercise[],
  exerciseByName: Map<string, ExerciseRow>
) {
  // keep the plan tight so the bot doesn't dump a 14-exercise monstrosity in one go
  return exercises.slice(0, 8).map((exercise, index) => ({
    source: exercise,
    exercise: exerciseByName.get(normalizeName(exercise.exercise_name)),
    order_index: index,
  }))
}

function buildWorkoutExercisesPayload(
  workoutId: string,
  resolvedExercises: ReturnType<typeof sanitizeWorkoutExercises>
) {
  return resolvedExercises.flatMap((entry) => {
    const fallbackSetCount = entry.exercise!.type === 'reps' ? 3 : 1
    const rawSets = Array.isArray(entry.source.sets) ? entry.source.sets : []
    const normalizedSets = rawSets.length > 0 ? rawSets : Array.from({ length: fallbackSetCount }, () => ({}))

    // chat plans are grouped by exercise now, but workout_exercises is still one row per set
    return normalizedSets.map((set, setIndex) => ({
      workout_id: workoutId,
      exercise_id: entry.exercise!.id,
      sets: 1,
      reps:
        entry.exercise!.type === 'reps'
          ? toNullableNumber(set.reps) ?? 10
          : null,
      time_seconds:
        entry.exercise!.type === 'timed'
          ? toNullableNumber(set.time_seconds) ?? 30
          : null,
      weight: toNullableNumber(set.weight),
      // leaving some spacing here makes reordering/debugging less annoying if we ever inspect raw rows
      order_index: entry.order_index * 100 + setIndex,
    }))
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

    const {
      messages,
      pending_action,
      confirmation,
    } = (await req.json()) as {
      messages?: ChatMessage[]
      pending_action?: PendingWorkoutEdit | null
      confirmation?: 'yes' | 'no' | null
    }

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

    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, name, type')
      .order('name', { ascending: true })

    if (exercisesError) {
      return json({ error: exercisesError.message }, { status: 500 })
    }

    const exerciseRows = (exercises ?? []) as ExerciseRow[]
    const exerciseByName = new Map(exerciseRows.map((exercise) => [normalizeName(exercise.name), exercise]))

    if (pending_action?.kind === 'edit_workout') {
      if (confirmation === 'no') {
        return json({
          reply: 'No problem. I left that workout untouched.',
        })
      }

      if (confirmation === 'yes') {
        const resolvedExercises = sanitizeWorkoutExercises(pending_action.exercises, exerciseByName)
        const missingExercises = resolvedExercises
          .filter((entry) => !entry.exercise)
          .map((entry) => entry.source.exercise_name)

        if (missingExercises.length > 0) {
          return json({
            reply: `I couldn't apply that edit because these exercises were not found: ${missingExercises.join(', ')}.`,
          })
        }

        const { error: workoutUpdateError } = await supabase
          .from('workouts')
          .update({ name: pending_action.workout_name.trim() || 'Updated Workout' })
          .eq('id', pending_action.workout_id)
          .eq('user_id', user.id)

        if (workoutUpdateError) {
          return json({ error: workoutUpdateError.message }, { status: 500 })
        }

        // easiest way here is wipe + replace since the AI may reorder and swap a lot of exercises
        const { error: deleteExercisesError } = await supabase
          .from('workout_exercises')
          .delete()
          .eq('workout_id', pending_action.workout_id)

        if (deleteExercisesError) {
          return json({ error: deleteExercisesError.message }, { status: 500 })
        }

        const workoutExercisesPayload = buildWorkoutExercisesPayload(
          pending_action.workout_id,
          resolvedExercises
        )

        const { error: insertExercisesError } = await supabase
          .from('workout_exercises')
          .insert(workoutExercisesPayload)

        if (insertExercisesError) {
          return json({ error: insertExercisesError.message }, { status: 500 })
        }

        return json({
          reply: `Done. I updated your workout for ${pending_action.performed_at}.`,
          workout_id: pending_action.workout_id,
        })
      }
    }

    if (sanitizedMessages.length === 0) {
      return json({ error: 'messages must include non-empty content.' }, { status: 400 })
    }

    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('id, name, performed_at, is_finished')
      .eq('user_id', user.id)
      .order('performed_at', { ascending: true })

    if (workoutsError) {
      return json({ error: workoutsError.message }, { status: 500 })
    }

    const workoutSummary = ((workouts ?? []) as WorkoutRow[]).slice(-12).map((workout) => ({
      id: workout.id,
      name: workout.name,
      performed_at: workout.performed_at,
      is_finished: workout.is_finished,
    }))

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const profileSummary = {
      username: (profile as ProfileRow | null)?.username ?? null,
      goal: (profile as ProfileRow | null)?.goal ?? null,
      current_streak: (profile as ProfileRow | null)?.current_streak ?? null,
      height_cm: (profile as ProfileRow | null)?.height_cm ?? null,
      body_weight_kg: (profile as ProfileRow | null)?.body_weight_kg ?? null,
    }

    const recentMessages = sanitizedMessages.slice(-10)
    const exerciseCatalog = buildExerciseCatalog(exerciseRows)

    const upstreamMessages = [
      {
        role: 'system',
        content: `You are the FitRepo assistant.
Be lively, warm, casual, and natural without getting corny. Sound like a sharp coach and helpful app guide, not a robotic FAQ or a corporate support script.
Respond with valid JSON only and no markdown.

Return exactly one of these shapes:
{"type":"reply","message":"..."}
{"type":"create_workout","message":"...","workout_name":"...","performed_at":"YYYY-MM-DD or natural date phrase","exercises":[{"exercise_name":"...","sets":[{"reps":number|null,"time_seconds":number|null,"weight":number|null}]}]}
{"type":"edit_workout","message":"...","workout_name":"...","performed_at":"YYYY-MM-DD or natural date phrase","exercises":[{"exercise_name":"...","sets":[{"reps":number|null,"time_seconds":number|null,"weight":number|null}]}]}

Rules:
- Use "reply" for normal conversation, off-topic banter, advice, or ambiguous requests.
- Make sure to stick to the FitRepo context, when the user asks something off-topic, use banter to switch back to FitRepo related topics.
- Keep replies personable and useful when the user goes off-script.
- Sound conversational and direct. A little playful is fine. Don't be stiff.
- Use "create_workout" only when the user clearly wants a new workout created in the app.
- Use "edit_workout" only when the user clearly wants an existing workout changed in the app.
- For create/edit actions, choose only exercise names from the provided catalog.
- If the user says a relative date like tomorrow or next Monday, preserve that intent in performed_at.
- Return 4 to 8 exercises for created or edited workouts unless the user asks otherwise.
- Each exercise must include a "sets" array.
- For reps exercises, each set should usually include reps and optionally weight.
- For timed exercises, each set should usually include time_seconds and optionally weight.
- Don't use the old flat reps/time/weight fields outside the set objects.
- Do not invent exercise names outside the catalog.
- Do not include extra keys.
- If the user asks to edit a workout, target the workout date they mention, or default to the nearest upcoming planned workout.

Today's date: ${getTodayDate()}

User profile:
${JSON.stringify(profileSummary)}

Exercise catalog:
${JSON.stringify(exerciseCatalog)}

Recent workouts:
${JSON.stringify(workoutSummary)}`,
      },
      ...recentMessages,
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
      return json({ error: 'Model provider request failed.', details }, { status: 502 })
    }

    const completion = await providerResponse.json()
    const content = extractTextFromContent(completion?.choices?.[0]?.message?.content)

    if (!content) {
      const finishReason = completion?.choices?.[0]?.finish_reason
      const providerError =
        typeof completion?.error?.message === 'string' ? completion.error.message : null

      return json(
        {
          error: 'Model provider returned no reply.',
          details:
            providerError ??
            `Model "${model}" returned an empty message${finishReason ? ` (finish_reason: ${finishReason})` : ''}. Response keys: ${Object.keys(completion ?? {}).join(', ') || 'none'}.`,
        },
        { status: 502 }
      )
    }

    const action = parseModelAction(content)

    // if the model ignores the json rule, just send the plain text back instead of hard failing
    if (!action) {
      return json({ reply: content.trim() })
    }

    if (action.type === 'reply') {
      return json({ reply: action.message.trim() })
    }

    if (!Array.isArray(action.exercises) || action.exercises.length === 0) {
      return json({
        reply:
          action.message?.trim() ||
          'I need a little more detail before I can build that workout. Tell me the goal, workout style, duration, or muscle groups you want.',
      })
    }

    const performedAt = parseRequestedDate(action.performed_at)
    const resolvedExercises = sanitizeWorkoutExercises(action.exercises, exerciseByName)
    const missingExercises = resolvedExercises
      .filter((entry) => !entry.exercise)
      .map((entry) => entry.source.exercise_name)

    if (missingExercises.length > 0) {
      return json({
        reply: `I couldn't use these exercises because they're not in your app yet: ${missingExercises.join(', ')}.`,
      })
    }

    if (action.type === 'edit_workout') {
      const targetWorkout =
        ((workouts ?? []) as WorkoutRow[]).find((workout) => workout.performed_at === performedAt) ??
        ((workouts ?? []) as WorkoutRow[]).find((workout) => !workout.is_finished)

      if (!targetWorkout) {
        return json({
          reply: `I couldn't find a planned workout to edit for ${performedAt}. Ask me to create one instead.`,
        })
      }

      // don't edit immediately, just hand the proposal back to the app for a yes/no
      return json({
        reply: action.message.trim() || `I drafted an update for your workout on ${targetWorkout.performed_at}.`,
        pending_action: {
          kind: 'edit_workout',
          workout_id: targetWorkout.id,
          workout_name: action.workout_name.trim() || targetWorkout.name,
          performed_at: targetWorkout.performed_at,
          message: action.message.trim(),
          exercises: action.exercises,
        },
      })
    }

    const { data: createdWorkout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: action.workout_name.trim() || 'AI Workout',
        performed_at: performedAt,
        is_finished: false,
      })
      .select()
      .single()

    if (workoutError || !createdWorkout) {
      return json({ error: workoutError?.message ?? 'Failed to create workout.' }, { status: 500 })
    }

    const workoutExercisesPayload = buildWorkoutExercisesPayload(createdWorkout.id, resolvedExercises)

    const { error: workoutExercisesError } = await supabase
      .from('workout_exercises')
      .insert(workoutExercisesPayload)

    if (workoutExercisesError) {
      // rollback here so we don't leave a dead empty workout lying around
      await supabase.from('workouts').delete().eq('id', createdWorkout.id)
      return json({ error: workoutExercisesError.message }, { status: 500 })
    }

    return json({
      reply: action.message.trim(),
      workout_id: createdWorkout.id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return json({ error: message }, { status: 500 })
  }
})
