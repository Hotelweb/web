import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { createChatSession, getChatMessages } from '../api'
import type { ChatMessage, ChatSession } from '../api'
import { CloseIcon, SendIcon, SparkleIcon } from './icons/ServiceIcons'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const LANGUAGES: Language[] = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
]

interface ChatWindowProps {
  hotelId: number
  hotelName: string
  onClose: () => void
}

export function ChatWindow({ hotelId, hotelName, onClose }: ChatWindowProps) {
  const [step, setStep] = useState<'language' | 'chat'>('language')
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) return

    const newSocket = io(`${API_BASE}/chat`, {
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      newSocket.emit('joinSession', { sessionId: session.id })
    })

    newSocket.on('newMessage', (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
    })

    socketRef.current = newSocket

    return () => {
      newSocket.disconnect()
      socketRef.current = null
    }
  }, [session])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (step === 'chat') {
      // Auto-focus input when entering chat
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [step])

  const handleLanguageSelect = async (langCode: string) => {
    setSelectedLanguage(langCode)
    setLoading(true)

    try {
      const storageKey = `chat_session_${hotelId}_${langCode}`
      const existingToken = localStorage.getItem(storageKey)

      let chatSession: ChatSession

      if (existingToken) {
        try {
          const res = await fetch(`${API_BASE}/chat/sessions/token/${existingToken}`)
          if (res.ok) {
            chatSession = await res.json()
            if (chatSession.status !== 'CLOSED') {
              setSession(chatSession)
              const msgs = await getChatMessages(chatSession.id)
              setMessages(msgs)
              setStep('chat')
              setLoading(false)
              return
            }
          }
        } catch {
          // Session expired or invalid
        }
      }

      chatSession = await createChatSession({
        hotel_id: hotelId,
        customer_language: langCode,
      })

      localStorage.setItem(storageKey, chatSession.customer_token)
      setSession(chatSession)

      const msgs = await getChatMessages(chatSession.id)
      setMessages(msgs)
      setStep('chat')
    } catch (err) {
      console.error('Failed to create chat session:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session || !selectedLanguage) return

    const messageText = inputMessage.trim()
    setInputMessage('')

    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: session.id,
      sender_type: 'CUSTOMER',
      message_type: 'TEXT',
      source_language: selectedLanguage,
      original_message: messageText,
      translated_message: null,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])

    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', {
        sessionId: session.id,
        message: messageText,
        source_language: selectedLanguage,
        sender_type: 'CUSTOMER',
      })
    } else {
      try {
        await fetch(`${API_BASE}/chat/sessions/${session.id}/messages/customer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            source_language: selectedLanguage,
          }),
        })
      } catch (err) {
        console.error('Failed to send message:', err)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-end sm:justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-0"
        onClick={onClose}
      />

      {/* Chat Container - full screen on mobile, popup on desktop (bottom-right) */}
      <div className="relative w-full h-full sm:w-[400px] sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:mr-6 sm:mb-6 bg-white sm:rounded-3xl overflow-hidden flex flex-col animate-slide-up shadow-modal sm:border sm:border-border-light">
        {/* Header - green gradient */}
        <header className="gradient-primary text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <SparkleIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] leading-tight truncate">{hotelName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse-soft" />
                <p className="text-xs text-white/85">
                  {step === 'language' ? 'Chọn ngôn ngữ' : 'Đang hoạt động'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors duration-200 cursor-pointer flex-shrink-0"
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </header>

        {/* Content */}
        {step === 'language' ? (
          <LanguageSelector
            languages={LANGUAGES}
            onSelect={handleLanguageSelect}
            loading={loading}
          />
        ) : (
          <ChatMessages
            messages={messages}
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSend={handleSendMessage}
            onKeyPress={handleKeyPress}
            inputRef={inputRef}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>
    </div>
  )
}

function LanguageSelector({
  languages,
  onSelect,
  loading,
}: {
  languages: Language[]
  onSelect: (code: string) => void
  loading: boolean
}) {
  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto bg-gray-50">
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-text">Chọn ngôn ngữ của bạn</h3>
        <p className="text-sm text-text-light mt-1">Chọn ngôn ngữ để bắt đầu trò chuyện</p>
      </div>

      <div className="flex flex-col gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            disabled={loading}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-border-light hover:border-primary/40 hover:shadow-card-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left"
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text text-[14px]">{lang.nativeName}</p>
              <p className="text-xs text-text-light mt-0.5">{lang.name}</p>
            </div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-5 gap-3">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-muted">Đang kết nối...</span>
        </div>
      ) : null}
    </div>
  )
}

function ChatMessages({
  messages,
  inputMessage,
  onInputChange,
  onSend,
  onKeyPress,
  inputRef,
  messagesEndRef,
}: {
  messages: ChatMessage[]
  inputMessage: string
  onInputChange: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-soft border border-border-light max-w-[80%] text-left">
              <p className="text-sm text-text leading-relaxed">
                Xin chào! Tôi là trợ lý ảo của khách sạn. Tôi có thể giúp gì cho quý khách?
              </p>
            </div>
          </div>
        ) : null}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border-light p-3 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Nhập tin nhắn..."
              className="w-full px-4 py-2.5 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white border border-transparent focus:border-primary/30 transition-all placeholder:text-text-lighter"
            />
          </div>
          <button
            onClick={onSend}
            disabled={!inputMessage.trim()}
            className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:shadow-card transition-all duration-200 flex-shrink-0 active:scale-95"
            aria-label="Send message"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isCustomer = message.sender_type === 'CUSTOMER'
  const isSystem = message.message_type === 'SYSTEM'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-white rounded-full px-3 py-1 max-w-[85%] shadow-soft border border-border-light">
          <p className="text-[11px] text-text-muted text-center">{message.original_message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
          isCustomer
            ? 'gradient-primary text-white rounded-br-md shadow-soft'
            : 'bg-white text-text rounded-bl-md shadow-soft border border-border-light'
        }`}
      >
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.original_message}
        </p>
        <p className={`text-[10px] mt-1 ${isCustomer ? 'text-white/60' : 'text-text-lighter'}`}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
