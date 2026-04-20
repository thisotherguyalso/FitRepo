import { supabase } from '@/lib/supabase'

const DEFAULT_EXERCISE_IMAGE_BUCKET = 'exercise-images'

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '')
}

export function resolveExerciseImageUrl(imagePath?: string | null) {
  const trimmed = imagePath?.trim()

  if (!trimmed) {
    return null
  }

  // already a real url, so just use it as-is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const bucket =
    process.env.EXPO_PUBLIC_EXERCISE_IMAGE_BUCKET?.trim() ||
    DEFAULT_EXERCISE_IMAGE_BUCKET

  // db can store either "bench.png" style paths or "bucket/path/to/file.png".
  // let both work so content entry stays flexible.
  const normalized = trimSlashes(trimmed)
  const bucketPrefix = `${bucket}/`
  const objectPath = normalized.startsWith(bucketPrefix)
    ? normalized.slice(bucketPrefix.length)
    : normalized

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath)
  return data.publicUrl || null
}
