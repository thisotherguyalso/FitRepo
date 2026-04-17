import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import {
  sendChatMessage,
  normalizeReply,
  type ChatResult,
  type ChatMessage,
  type PendingWorkoutEdit,
} from '@/lib/api/chat'
import { clearChatHistory, loadChatHistory, saveChatHistory } from '@/lib/chat-history'
import { useAppColors, AppColors, sharedStyles } from '@/constants/styles'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '@/lib/supabase'

type LocalMessage = ChatMessage & {
  id: string
  pending?: boolean
}

function buildMessage(role: 'user' | 'assistant', content: string, pending = false): LocalMessage {
  return {
    // local ids only exist for rendering. persisted chat history stores the clean payload without these.
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    pending,
  }
}

function normalizeStoredMessage(message: ChatMessage) {
  if (message.role !== 'assistant') {
    return message.content
  }

  return normalizeReply(message.content)
}

let activeChatRequest: Promise<ChatResult> | null = null
let activeChatBaseMessages: LocalMessage[] | null = null
// these module-level refs keep the pending request alive even if the tab remounts mid-response

export default function ChatScreen() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [createdWorkoutId, setCreatedWorkoutId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingWorkoutEdit | null>(null)
  const [historyReady, setHistoryReady] = useState(false)
  const isMounted = useRef(true)
  const [messages, setMessages] = useState<LocalMessage[]>([
    buildMessage(
      'assistant',
      'I can help with workout ideas, create workouts in the app, and propose edits to existing workouts before changing them.'
    ),
  ])

  function toApiMessages(nextMessages: LocalMessage[]): ChatMessage[] {
    return nextMessages
      // the fake "thinking..." bubble is UI-only, so never send it back to the model
      .filter((message) => !message.pending)
      .map(({ role, content }) => ({ role, content }))
  }

  useEffect(() => {
    isMounted.current = true

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted.current) return

      const nextUserId = user?.id ?? 'guest'
      setUserId(nextUserId)

      const stored = loadChatHistory(nextUserId)
      if (!stored) {
        setHistoryReady(true)
        return
      }

      // rebuild local ids here since storage only keeps the real message payload
      setMessages(
        stored.messages
          .filter((message) => message.role !== 'system')
          .map((message) =>
            buildMessage(
              message.role as 'user' | 'assistant',
              normalizeStoredMessage(message)
            )
          )
      )
      setPendingAction(stored.pendingAction)
      setCreatedWorkoutId(stored.createdWorkoutId)
      setHistoryReady(true)
    })()

    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!historyReady || !userId) return

    saveChatHistory(userId, {
      messages: toApiMessages(messages),
      pendingAction,
      createdWorkoutId,
    })
  }, [messages, pendingAction, createdWorkoutId, historyReady, userId])

  useEffect(() => {
    if (!historyReady) return
    if (!activeChatRequest || !activeChatBaseMessages) return

    // if the tab remounts mid-request, rebuild the temp loading bubble and keep things locked
    setMessages([
      ...activeChatBaseMessages,
      buildMessage('assistant', 'Thinking through it...', true),
    ])
    setLoading(true)

    void activeChatRequest
      .then((result) => {
        if (!isMounted.current || !activeChatBaseMessages) return

        setMessages([
          ...activeChatBaseMessages,
          buildMessage('assistant', result.reply),
        ])
        setCreatedWorkoutId(result.workoutId ?? null)
        setPendingAction(result.pendingAction ?? null)
      })
      .catch((error: any) => {
        if (!isMounted.current || !activeChatBaseMessages) return

        setMessages(activeChatBaseMessages)
        Alert.alert('Chat error', error.message ?? 'Failed to send message.')
      })
      .finally(() => {
        activeChatRequest = null
        activeChatBaseMessages = null

        if (!isMounted.current) return

        setLoading(false)
      })
  }, [historyReady])

  async function runChatRequest(
    nextMessages: LocalMessage[],
    options?: {
      pendingAction?: PendingWorkoutEdit | null
      confirmation?: 'yes' | 'no'
    }
  ) {
    if (activeChatRequest) {
      return
    }

    // fake assistant bubble while waiting so the loading feels like part of the convo
    const loadingMessage = buildMessage('assistant', 'Thinking through it...', true)
    setMessages([...nextMessages, loadingMessage])
    setLoading(true)
    setCreatedWorkoutId(null)

    activeChatBaseMessages = nextMessages
    activeChatRequest = sendChatMessage(toApiMessages(nextMessages), options)

    try {
      const result = await activeChatRequest
      const finalMessages = [...nextMessages, buildMessage('assistant', result.reply)]

      setMessages(finalMessages)
      setCreatedWorkoutId(result.workoutId ?? null)
      setPendingAction(result.pendingAction ?? null)
    } catch (error: any) {
      // roll back the temp loading bubble if the request dies
      setMessages(nextMessages)
      Alert.alert('Chat error', error.message ?? 'Failed to send message.')
    } finally {
      activeChatRequest = null
      activeChatBaseMessages = null

      setLoading(false)
    }
  }

  async function handleSend() {
    const trimmed = input.trim()

    if (!trimmed || loading) {
      return
    }

    const userMessage = buildMessage('user', trimmed)
    const nextMessages = [...messages, userMessage]

    setInput('')
    setPendingAction(null)
    await runChatRequest(nextMessages)
  }

  async function handleEditConfirmation(confirmation: 'yes' | 'no') {
    if (!pendingAction || loading) {
      return
    }

    const confirmationMessage = buildMessage(
      'user',
      confirmation === 'yes' ? 'Yes, go ahead.' : 'No, cancel that.'
    )
    const nextMessages = [...messages, confirmationMessage]

    setPendingAction(null)
    await runChatRequest(nextMessages, {
      pendingAction,
      confirmation,
    })
  }

  const colors = useAppColors();

  return (
    <ParallaxScrollView>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={sharedStyles.background}
      />
      <View style={styles.container}>
        <Text style={[sharedStyles.title, styles.title]}>FitRepo Chat</Text>
        <Text style={[styles.subtitle, {color: colors.textMuted}]}>
          Ask for advice, create workouts, or say things like &quot;Edit my workout for tomorrow.&quot;
        </Text>

        <ScrollView
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}>
          {messages.map((message) => {
            const isUser = message.role === 'user'

            return (
              <View
                key={message.id}
                style={[
                  sharedStyles.card,
                  styles.messageBubble,
                  {backgroundColor: isUser ? colors.primary : colors.surface},
                  message.pending && styles.pendingBubble,
                ]}>
                <Text style={[styles.messageRole, {color: isUser ? '#fff' : colors.textChatbotTitle}]}>
                  {message.pending ? 'Working' : isUser ? 'You' : 'Assistant'}
                </Text>
                <Text style={[styles.messageText, {color: isUser ? '#fff': colors.textChatbot}]}>{message.content}</Text>
              </View>
            )
          })}
        </ScrollView>

        {pendingAction ? (
          <View style={[sharedStyles.card, styles.confirmCard]}>
            <Text style={[styles.confirmTitle, {color: '#fff'}]}>Confirm workout edit?</Text>
            <Text style={styles.confirmText}>
              This will update your workout for {pendingAction.performed_at}. Want me to do it?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[sharedStyles.button, styles.confirmYes]}
                onPress={() => void handleEditConfirmation('yes')}>
                <Text style={sharedStyles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[sharedStyles.button, styles.confirmNo]}
                onPress={() => void handleEditConfirmation('no')}>
                <Text style={sharedStyles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

      {createdWorkoutId ? (
          <View style={[{
              overflow: 'hidden',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.accent1Border,
              height: 60
            }]}>
            <TouchableOpacity
              style={[sharedStyles.button, styles.openWorkoutButton, styles.actionButton,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/view_workout',
                  params: { workout_id: createdWorkoutId },
                })
              }>
              <LinearGradient
                colors={[colors.accent1Alt, colors.accent1]}
                style={styles.workoutLinkGradient}
              >
                <Text style={[sharedStyles.buttonText, {color: '#fff', margin:15}]}>View Workout?</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[{
          alignContent: 'center',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: "stretch",          

          backgroundColor: colors.surface, 
          borderRadius: 16,
        }]}>
          <TextInput
            style={[sharedStyles.input, styles.input, {
              minWidth: 250,
              maxWidth: 250,
              borderRadius: 16,

              backgroundColor: colors.panelAlt,
              color: colors.text
            }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask or create a workout..."
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
            editable={!loading}
          />
          <TouchableOpacity
            style={[sharedStyles.button, loading && styles.sendButtonDisabled, {width: 80}]}
            onPress={() => void handleSend()}
            disabled={loading}>
            <Text style={[sharedStyles.buttonText, {color: colors.text, textAlignVertical: 'center', textAlign: 'center'}]}>Send ➤</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[
            sharedStyles.button,
            styles.clearButton,
            styles.actionButton,
            { backgroundColor: colors.signOut },
            loading && styles.sendButtonDisabled,
          ]}
          onPress={() => {
            if (userId) {
              clearChatHistory(userId)
            }
            setCreatedWorkoutId(null)
            setPendingAction(null)
            setMessages([
              buildMessage(
                'assistant',
                'Clean slate. Ask for advice, create a workout, or tell me to edit one.'
              ),
            ])
          }}
          disabled={loading}>
          <Text style={sharedStyles.buttonText}>Clear Chat</Text>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    color: AppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  messageList: {
    maxHeight: 500,
  },
  messageListContent: {
    gap: 12,
    paddingBottom: 8,
  },
  messageBubble: {
    paddingVertical: 14,
  },
  pendingBubble: {
    opacity: 0.8,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  messageText: {
    color: AppColors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  confirmCard: {
    backgroundColor: AppColors.panel,
  },
  confirmTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  confirmText: {
    color: AppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmYes: {
    flex: 1,
    backgroundColor: AppColors.secondary,
  },
  confirmNo: {
    flex: 1,
    backgroundColor: AppColors.danger,
  },
  input: {
    minHeight: 96,
    marginBottom: 0,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  openWorkoutButton: {
    marginBottom: 24,
  },
  workoutLinkGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: AppColors.danger,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
})
