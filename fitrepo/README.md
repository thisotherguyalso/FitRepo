# FitRepo

FitRepo is an Expo + Supabase workout app with workout planning, presets, auth, and a chat tab backed by a Supabase Edge Function.

## App setup

1. Install dependencies

```bash
npm install
```

2. Create your `.env`

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Start the app

```bash
npm start
```

## Chat via Supabase Edge Functions

The chat tab calls the `chat` edge function through `supabase.functions.invoke(...)`.
The function can now either return a normal reply or create a workout in the app and return its `workout_id`.

Full chat docs:
- [docs/chat.md](/C:/Users/User/Desktop/Folders/Computer%20Codes/GitHub/FitRepo/fitrepo/docs/chat.md)

### Function files

- `supabase/functions/chat/index.ts`
- `lib/api/chat.ts`
- `app/(tabs)/chat.tsx`

### Required function secrets

Set these in Supabase:

```bash
supabase secrets set OPENROUTER_API_KEY=your_openrouter_key
supabase secrets set OPENROUTER_MODEL=openrouter/free
```

`OPENROUTER_MODEL` is optional. If omitted, the function defaults to `openrouter/free`.

### Run the function when needed

```bash
supabase functions deploy chat
```

If you want to test locally:

```bash
supabase functions serve chat
```

### How auth works

The mobile app sends the logged-in user's Supabase auth token automatically when invoking the function.
The function validates the caller with `supabase.auth.getUser()` before forwarding the prompt to the model provider.

### AI workout creation

If the user clearly asks the chat assistant to create a workout, the edge function:

- asks the model for a structured workout plan
- resolves exercise names against the `exercises` table
- parses dates like `today`, `tomorrow`, and `next Monday`
- creates a `workouts` row
- creates matching `workout_exercises` rows
- returns the created `workout_id` so the app can open it

### AI workout editing

If the user asks to edit an existing workout, the assistant now proposes the change first.
The app shows a `Yes` / `No` confirmation card before any workout rows are updated.

## Validation

```bash
npm run lint
npm test -- --runInBand
```
