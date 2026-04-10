import 'expo-sqlite/localStorage/install'

import type { ChatMessage, PendingWorkoutEdit } from '@/lib/api/chat'

const CHAT_HISTORY_KEY = 'fitrepo.chat.history'
const MAX_CHAT_HISTORY = 50

export type StoredChatState = {
  messages: ChatMessage[]
  pendingAction: PendingWorkoutEdit | null
  createdWorkoutId: string | null
}

function hasStorage() {
  return typeof globalThis.localStorage !== 'undefined'
}

// keep the newest chunk only so history doesn't get stupidly big
function trimMessages(messages: ChatMessage[]) {
  return messages.slice(-MAX_CHAT_HISTORY)
}

export function loadChatHistory(): StoredChatState | null {
  if (!hasStorage()) return null

  const raw = globalThis.localStorage.getItem(CHAT_HISTORY_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StoredChatState

    // quick sanity check so bad storage data doesn't blow up the chat screen
    if (!Array.isArray(parsed.messages)) {
      return null
    }

    return {
      messages: trimMessages(parsed.messages),
      pendingAction: parsed.pendingAction ?? null,
      createdWorkoutId: parsed.createdWorkoutId ?? null,
    }
  } catch {
    // if storage gets corrupted just ignore it and start fresh
    return null
  }
}

export function saveChatHistory(state: StoredChatState) {
  if (!hasStorage()) return

  // only store the real chat state, not temporary loading bubbles
  globalThis.localStorage.setItem(
    CHAT_HISTORY_KEY,
    JSON.stringify({
      messages: trimMessages(state.messages),
      pendingAction: state.pendingAction,
      createdWorkoutId: state.createdWorkoutId,
    })
  )
}

export function clearChatHistory() {
  if (!hasStorage()) return
  globalThis.localStorage.removeItem(CHAT_HISTORY_KEY)
}
