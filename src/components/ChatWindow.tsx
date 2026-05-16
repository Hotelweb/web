import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { createChatSession, getChatMessages } from '../api'
import type { ChatMessage, ChatSession } from '../api'

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
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [session])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

    if (socket?.connected) {
      socket.emit('sendMessage', {
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

      {/* Chat Container - full screen on mobile, modal on desktop */}
      <div className="relative w-full h-full sm:w-[420px] sm:h-[680px] sm:max-h-[90vh] bg-white sm:rounded-2xl overflow-hidden flex flex-col animate-slide-up shadow-premium-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 gradient-primary text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[15px] leading-tight">{hotelName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-white/80">
                  {step === 'language' ? 'Select language' : 'Online'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors duration-200 cursor-pointer"
            aria-label="Close chat"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

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
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>
    </div>
  )
}

// Language Selector Component
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
    <div className="flex-1 flex flex-col p-5 sm:p-6 overflow-y-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-premium">
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-text">Choose your language</h3>
        <p className="text-sm text-text-muted mt-1.5">
          Select a language to start chatting with us
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            disabled={loading}
            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group active:scale-[0.98]"
          >
            <span className="text-3xl">{lang.flag}</span>
            <div className="text-left flex-1">
              <p className="font-semibold text-text text-[15px] group-hover:text-primary transition-colors duration-200">
                {lang.nativeName}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{lang.name}</p>
            </div>
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-text-light group-hover:text-primary transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-5 gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-muted">Connecting...</span>
        </div>
      )}
    </div>
  )
}

// Chat Messages Component
function ChatMessages({
  messages,
  inputMessage,
  onInputChange,
  onSend,
  onKeyPress,
  messagesEndRef,
}: {
  messages: ChatMessage[]
  inputMessage: string
  onInputChange: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-b from-background/30 to-background/60">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-primary/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-text-muted">Start a conversation</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border-light p-3 sm:p-4 bg-white">
        <div className="flex items-end gap-2.5">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 rounded-2xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-border-light focus:border-primary/30 focus:bg-white placeholder:text-text-light"
            />
          </div>
          <button
            onClick={onSend}
            disabled={!inputMessage.trim()}
            className="w-11 h-11 rounded-full gradient-primary text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:shadow-premium transition-all duration-200 flex-shrink-0 active:scale-95"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

// Message Bubble Component
function MessageBubble({ message }: { message: ChatMessage }) {
  const isCustomer = message.sender_type === 'CUSTOMER'
  const isSystem = message.message_type === 'SYSTEM'

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 max-w-[85%] shadow-sm border border-border-light">
          <p className="text-xs text-text-muted text-center">{message.original_message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {/* Staff avatar */}
      {!isCustomer && (
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white flex-shrink-0 mr-2 mt-auto mb-1 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 ${
          isCustomer
            ? 'gradient-primary text-white rounded-br-md shadow-sm'
            : 'bg-white text-text rounded-bl-md shadow-sm border border-border-light'
        }`}
      >
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.original_message}
        </p>
        <p className={`text-[10px] mt-1.5 ${isCustomer ? 'text-white/50' : 'text-text-light'}`}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
