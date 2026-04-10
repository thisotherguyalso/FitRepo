# Chat System

This is the full chat stack for FitRepo.

## File map

- [chat screen](/C:/Users/User/Desktop/Folders/Computer%20Codes/GitHub/FitRepo/fitrepo/app/(tabs)/chat.tsx)
- [chat api client](/C:/Users/User/Desktop/Folders/Computer%20Codes/GitHub/FitRepo/fitrepo/lib/api/chat.ts)
- [chat history storage](/C:/Users/User/Desktop/Folders/Computer%20Codes/GitHub/FitRepo/fitrepo/lib/chat-history.ts)
- [edge function](/C:/Users/User/Desktop/Folders/Computer%20Codes/GitHub/FitRepo/fitrepo/supabase/functions/chat/index.ts)
- [supabase function config](/C:/Users/User/Desktop/Folders/Computer%20Codes/GitHub/FitRepo/fitrepo/supabase/config.toml)

## How it works

1. The app sends chat messages from the chat tab.
2. The client sends those messages to the deployed Supabase Edge Function.
3. The edge function checks the signed-in Supabase user.
4. The edge function calls OpenRouter.
5. The model returns one of three action shapes:
   - `reply`
   - `create_workout`
   - `edit_workout`
6. For workout actions, the function uses real exercise rows from the database and then writes the workout into Supabase.
7. The app gets back the assistant reply plus an optional `workout_id` or pending edit confirmation payload.

## Chat history

Chat history is stored locally in [chat history storage](/C:/Users/User/Desktop/Folders/Computer%20Codes/GitHub/FitRepo/fitrepo/lib/chat-history.ts).

What gets saved:
- chat messages
- pending edit confirmation state
- created workout id

What does not get saved:
- temporary loading placeholder bubbles

## Workout creation

The edge function can create workouts directly in the app when the user clearly asks for it.

Current behavior:
- matches exercise names against the `exercises` table
- parses dates like `today`, `tomorrow`, and `next Monday`
- creates `workouts`
- creates `workout_exercises`
- returns the created `workout_id`

## Workout editing

The assistant can also propose edits to an existing workout.

Current behavior:
- the model proposes an `edit_workout` action
- the app shows a `Yes` / `No` confirmation card
- nothing is changed until the user confirms
- on `Yes`, the edge function replaces the workout exercise rows with the new plan

## UI behavior

The chat screen now:
- shows a loading placeholder bubble in the conversation
- keeps the send button visible
- shows an `Open Workout` button after creation
- keeps a `Clear Chat` button when a created workout is active

## Official docs

- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Functions config: https://supabase.com/docs/guides/functions/function-configuration
- OpenRouter chat completions: https://openrouter.ai/docs/api-reference/chat-completion
- Expo SQLite localStorage install: https://docs.expo.dev/versions/latest/sdk/sqlite/
