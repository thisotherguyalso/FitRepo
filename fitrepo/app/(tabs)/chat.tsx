import { useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { sendChatMessage, type ChatMessage } from '@/lib/api/chat'
import { AppColors, sharedStyles } from '@/constants/styles'

export default function ChatScreen() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Ask me for workout ideas, substitutions, exercise explanations, or help using FitRepo.',
    },
  ])

  async function handleSend() {
    const trimmed = input.trim()

    if (!trimmed || loading) {
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
    }

    const previousMessages = messages
    const nextMessages = [...previousMessages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const reply = await sendChatMessage(nextMessages)

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: reply,
        },
      ])
    } catch (error: any) {
      setMessages(previousMessages)
      Alert.alert('Chat error', error.message ?? 'Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <View style={styles.container}>
        <Text style={[sharedStyles.title, styles.title]}>FitRepo Chat</Text>

        <ScrollView
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}>
          {messages.map((message, index) => {
            const isAssistant = message.role === 'assistant'

            return (
              <View
                key={`${message.role}-${index}`}
                style={[
                  sharedStyles.card,
                  styles.messageBubble,
                  isAssistant ? styles.assistantBubble : styles.userBubble,
                ]}>
                <Text style={[styles.messageRole, isAssistant ? styles.assistantRole : styles.userRole]}>
                  {isAssistant ? 'Assistant' : 'You'}
                </Text>
                <Text style={styles.messageText}>{message.content}</Text>
              </View>
            )
          })}
        </ScrollView>

        <TextInput
          style={[sharedStyles.input, styles.input]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[sharedStyles.button, styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading}>
          <Text style={sharedStyles.buttonText}>
            {loading ? 'Sending...' : 'Send'}
          </Text>
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
    marginBottom: 8,
  },
  messageList: {
    maxHeight: 480,
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
    backgroundColor: AppColors.primaryDark,
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
  input: {
    minHeight: 96,
  },
  sendButton: {
    backgroundColor: AppColors.primary,
    marginBottom: 24,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
})
