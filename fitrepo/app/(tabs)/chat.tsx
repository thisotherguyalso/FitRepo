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
  type ChatResult,
  type ChatMessage,
  type PendingWorkoutEdit,
} from '@/lib/api/chat'
import { clearChatHistory, loadChatHistory, saveChatHistory } from '@/lib/chat-history'
import { useAppColors, AppColors, sharedStyles } from '@/constants/styles'
import { LinearGradient } from 'expo-linear-gradient'

type LocalMessage = ChatMessage & {
  id: string
  pending?: boolean
}

function buildMessage(role: 'user' | 'assistant', content: string, pending = false): LocalMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    pending,
  }
}

let activeChatRequest: Promise<ChatResult> | null = null
let activeChatBaseMessages: LocalMessage[] | null = null

export default function ChatScreen() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
      .filter((message) => !message.pending)
      .map(({ role, content }) => ({ role, content }))
  }

  useEffect(() => {
    isMounted.current = true

    const stored = loadChatHistory()
    if (!stored) {
      setHistoryReady(true)
      return
    }

    // rebuild local ids here since storage only keeps the real message payload
    setMessages(
      stored.messages
        .filter((message) => message.role !== 'system')
        .map((message) => buildMessage(message.role as 'user' | 'assistant', message.content))
    )
    setPendingAction(stored.pendingAction)
    setCreatedWorkoutId(stored.createdWorkoutId)
    setHistoryReady(true)

    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!historyReady) return

    saveChatHistory({
      messages: toApiMessages(messages),
      pendingAction,
      createdWorkoutId,
    })
  }, [messages, pendingAction, createdWorkoutId, historyReady])

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
        if (!isMounted.current) return

        setLoading(false)
        activeChatRequest = null
        activeChatBaseMessages = null
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
      setLoading(false)
      activeChatRequest = null
      activeChatBaseMessages = null
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
            const isAssistant = message.role === 'assistant'

            return (
              <View
                key={message.id}
                style={[
                  sharedStyles.card,
                  styles.messageBubble,
                  {backgroundColor: isAssistant ? colors.surface : colors.primary},
                  message.pending && styles.pendingBubble,
                ]}>
                <Text style={[styles.messageRole, {color: isAssistant ? colors.textChatbotTitle : '#fff'}]}>
                  {message.pending ? 'Working' : isAssistant ? 'Assistant' : 'You'}
                </Text>
                <Text style={[styles.messageText, {color: isAssistant ? colors.textChatbot : '#fff'}]}>{message.content}</Text>
              </View>
            )
          })}
        </ScrollView>

        {pendingAction ? (
          <View style={[sharedStyles.card, styles.confirmCard]}>
            <Text style={styles.confirmTitle}>Confirm workout edit?</Text>
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
                style={[sharedStyles.background, {height: 85}]}
              />
              <Text style={[sharedStyles.buttonText]}>View Workout?</Text>
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
          style={[sharedStyles.button, styles.clearButton, styles.actionButton, {backgroundColor: colors.signOut}]}
          onPress={() => {
            clearChatHistory()
            setCreatedWorkoutId(null)
            setPendingAction(null)
            setMessages([
              buildMessage(
                'assistant',
                'Clean slate. Ask for advice, create a workout, or tell me to edit one.'
              ),
            ])
          }}>
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
  assistantBubble: {
    backgroundColor: AppColors.surface,
  },
  userBubble: {
    backgroundColor: AppColors.primary,
  },
  pendingBubble: {
    opacity: 0.8,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  assistantRole: {
    color: AppColors.secondary,
  },
  userRole: {
    color: AppColors.textAccent,
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
    backgroundColor: AppColors.secondary,
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: AppColors.danger,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
})
