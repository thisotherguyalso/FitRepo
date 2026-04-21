function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function hasAnyPhrase(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(phrase))
}

export function inferExerciseTags(name: string, description?: string | null) {
  const nameText = normalizeText(name)
  const descriptionText = normalizeText(description ?? '')
  const tags = new Set<string>()

  // mostly trust the exercise name. descriptions are noisy and love saying stuff like
  // "stand shoulder-width apart", which is how squats were ending up as shoulder work.
  if (hasAnyPhrase(nameText, ['bench press', 'bench', 'chest fly', 'chest flies', 'push up', 'push ups'])) {
    tags.add('Chest')
  }

  if (hasAnyPhrase(nameText, ['dip', 'dips', 'tricep', 'triceps', 'pushdown', 'skull crusher', 'skull crushers', 'close grip'])) {
    tags.add('Triceps')
  }

  if (hasAnyPhrase(nameText, ['overhead press', 'lateral raise', 'front raise', 'push jerk', 'pike push up', 'pike pushup'])) {
    tags.add('Shoulders')
  }

  if (hasAnyPhrase(nameText, ['row', 'pull up', 'pull ups', 'pullup', 'pullups', 'pulldown', 'lat pulldown', 'face pull', 'dead hang', 't bar'])) {
    tags.add('Back')
  }

  if (hasAnyPhrase(nameText, ['bicep curl', 'bicep curls', 'hammer curl', 'hammer curls', 'preacher curl', 'preacher curls', 'chin up', 'chin ups', 'chinup', 'chinups'])) {
    tags.add('Biceps')
  }

  if (hasAnyPhrase(nameText, ['squat', 'squats', 'lunge', 'lunges', 'leg press', 'leg extension', 'split squat', 'jump squat', 'pistol squat'])) {
    tags.add('Quads')
  }

  if (hasAnyPhrase(nameText, ['deadlift', 'romanian deadlift', 'rdl', 'leg curl'])) {
    tags.add('Hamstrings')
  }

  if (hasAnyPhrase(nameText, ['hip thrust', 'hip abductor', 'glute bridge', 'bridge', 'bulgarian split squat'])) {
    tags.add('Glutes')
  }

  if (hasAnyPhrase(nameText, ['calf raise', 'calf raises'])) {
    tags.add('Calves')
  }

  if (hasAnyPhrase(nameText, ['plank', 'crunch', 'crunches', 'leg raise', 'leg raises', 'russian twist', 'v sit', 'mountain climber', 'mountain climbers'])) {
    tags.add('Core')
  }

  if (hasAnyPhrase(nameText, ['wrist curl', 'reverse wrist curl', 'farmer hold'])) {
    tags.add('Forearms')
  }

  if (hasAnyPhrase(nameText, ['burpee', 'burpees', 'battle ropes', 'jump rope', 'running', 'cycling'])) {
    tags.add('Conditioning')
  }

  // description only gets to help for explicit muscle words, not generic movement cues.
  if (descriptionText) {
    if (hasAnyPhrase(descriptionText, ['pectoral', 'pecs', 'chest'])) tags.add('Chest')
    if (hasAnyPhrase(descriptionText, ['tricep', 'triceps'])) tags.add('Triceps')
    if (hasAnyPhrase(descriptionText, ['deltoid', 'delts'])) tags.add('Shoulders')
    if (hasAnyPhrase(descriptionText, ['lat', 'lats', 'upper back', 'mid back'])) tags.add('Back')
    if (hasAnyPhrase(descriptionText, ['bicep', 'biceps'])) tags.add('Biceps')
    if (hasAnyPhrase(descriptionText, ['quad', 'quads'])) tags.add('Quads')
    if (hasAnyPhrase(descriptionText, ['hamstring', 'hamstrings'])) tags.add('Hamstrings')
    if (hasAnyPhrase(descriptionText, ['glute', 'glutes'])) tags.add('Glutes')
    if (hasAnyPhrase(descriptionText, ['calf', 'calves'])) tags.add('Calves')
    if (hasAnyPhrase(descriptionText, ['core', 'abs', 'abdominals', 'oblique', 'obliques'])) tags.add('Core')
    if (hasAnyPhrase(descriptionText, ['forearm', 'forearms', 'grip'])) tags.add('Forearms')
  }

  if (tags.size === 0) {
    tags.add('General')
  }

  return Array.from(tags).slice(0, 3)
}
