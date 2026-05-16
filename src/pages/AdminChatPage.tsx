import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { getHotel, getHotelSessions, getChatMessages, sendStaffMessage } from '../api'
import type { Hotel, ChatSession, ChatMessage } from '../api'
import {
  SearchIcon,
  PlusIcon,
  PhoneIcon,
  VideoIcon,
  MoreIcon,
  PaperclipIcon,
  ImageIcon,
  SmileIcon,
  SendIcon,
} from '../components/icons/ServiceIcons'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const LANGUAGE_LABELS: Record<string, string> = {
  vi: '🇻🇳 Tiếng Việt',
  en: '🇬🇧 English',
  ja: '🇯🇵 日本語',
  zh: '🇨🇳 中文',
  ko: '🇰🇷 한국어',
}

export function AdminChatPage() {
  const { hotelId } = useParams<{ hotelId: string }>()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const staffUserId = 1

  useEffect(() => {
    if (!hotelId) return

    async function load() {
      try {
        const [hotelData, sessionsData] = await Promise.all([
          getHotel(Number(hotelId)),
          getHotelSessions(Number(hotelId)),
        ])
        setHotel(hotelData)
        setSessions(sessionsData)
      } catch (err) {
        console.error('Failed to load:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [hotelId])

  useEffect(() => {
    if (!hotelId) return

    const newSocket = io(`${API_BASE}/chat`, {
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      newSocket.emit('joinHotel', { hotelId: Number(hotelId) })
    })

    newSocket.on('sessionUpdate', (data: { sessionId: number; message: ChatMessage }) => {
      if (activeSession && data.sessionId === activeSession.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev
          return [...prev, data.message]
        })
      }
      getHotelSessions(Number(hotelId)).then(setSessions).catch(console.error)
    })

    socketRef.current = newSocket
    return () => {
      newSocket.disconnect()
      socketRef.current = null
    }
  }, [hotelId, activeSession])

  useEffect(() => {
    if (!socketRef.current || !activeSession) return
    socketRef.current.emit('joinSession', { sessionId: activeSession.id })
  }, [activeSession])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const handler = (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
    }

    socket.on('newMessage', handler)
    return () => {
      socket.off('newMessage', handler)
    }
  }, [activeSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectSession = async (session: ChatSession) => {
    setActiveSession(session)
    try {
      const msgs = await getChatMessages(session.id)
      setMessages(msgs)
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeSession) return

    const messageText = inputMessage.trim()
    setInputMessage('')

    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: activeSession.id,
      sender_type: 'STAFF',
      message_type: 'TEXT',
      source_language: 'vi',
      original_message: messageText,
      translated_message: null,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])

    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', {
        sessionId: activeSession.id,
        message: messageText,
        source_language: 'vi',
        sender_type: 'STAFF',
        sender_user_id: staffUserId,
      })
    } else {
      try {
        await sendStaffMessage(activeSession.id, staffUserId, {
          message: messageText,
          source_language: 'vi',
        })
      } catch (err) {
        console.error('Failed to send:', err)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Filter sessions by search
  const filteredSessions = sessions.filter((s) => {
    const name = (s.customer_name || `Guest #${s.id}`).toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-warm">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background-warm overflow-hidden">
      {/* Sidebar - Conversations List */}
      <aside className="w-[320px] bg-white border-r border-border flex flex-col flex-shrink-0">
        {/* Header with title + new chat */}
        <div className="px-4 pt-4 pb-3 border-b border-border-light flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-text">Messages</h1>
              {hotel ? (
                <p className="text-xs text-text-light truncate mt-0.5">{hotel.name}</p>
              ) : null}
            </div>
            <button
              className="w-10 h-10 rounded-xl gradient-indigo text-white flex items-center justify-center hover:shadow-card transition-all duration-200 cursor-pointer flex-shrink-0"
              aria-label="New conversation"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white border border-transparent focus:border-indigo-300 transition-all placeholder:text-text-lighter"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-text-lighter"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-text-muted">
                {searchQuery ? 'No conversations match' : 'No conversations yet'}
              </p>
              <p className="text-xs text-text-lighter mt-1">
                {searchQuery ? 'Try a different search' : 'Waiting for customers'}
              </p>
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-1">
              {filteredSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={activeSession?.id === session.id}
                  onClick={() => handleSelectSession(session)}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {activeSession ? (
          <>
            {/* Top bar */}
            <header className="px-6 py-3 border-b border-border-light flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={activeSession.customer_name || `Guest ${activeSession.id}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-text text-[15px] truncate">
                    {activeSession.customer_name || `Guest #${activeSession.id}`}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeSession.status === 'OPEN'
                          ? 'bg-emerald-500'
                          : activeSession.status === 'ASSIGNED'
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-xs text-emerald-600 font-medium">
                      {activeSession.status === 'OPEN' ? 'Active now' : activeSession.status}
                    </span>
                    <span className="text-text-lighter text-xs">·</span>
                    <span className="text-xs text-text-light">
                      {LANGUAGE_LABELS[activeSession.customer_language] ||
                        activeSession.customer_language}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-text-muted">
                <button
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                  aria-label="Voice call"
                >
                  <PhoneIcon className="w-5 h-5" />
                </button>
                <button
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                  aria-label="Video call"
                >
                  <VideoIcon className="w-5 h-5" />
                </button>
                <button
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                  aria-label="More options"
                >
                  <MoreIcon className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-white">
              <DateDivider label="Today" />
              {messages.map((msg, idx) => (
                <AdminMessageBubble
                  key={msg.id}
                  message={msg}
                  customerName={activeSession.customer_name || `Guest ${activeSession.id}`}
                  showAvatar={shouldShowAvatar(messages, idx)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="px-6 py-3 border-t border-border-light bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 text-text-muted cursor-pointer flex-shrink-0"
                  aria-label="Attach file"
                >
                  <PaperclipIcon className="w-5 h-5" />
                </button>
                <button
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 text-text-muted cursor-pointer flex-shrink-0"
                  aria-label="Attach image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white border border-transparent focus:border-indigo-300 transition-all placeholder:text-text-lighter"
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center text-text-muted cursor-pointer"
                    aria-label="Add emoji"
                  >
                    <SmileIcon className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="w-11 h-11 rounded-xl gradient-indigo text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:shadow-card transition-all duration-200 flex-shrink-0 active:scale-95"
                  aria-label="Send message"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50/50">
            <div className="text-center px-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-indigo flex items-center justify-center shadow-elevated">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-text font-semibold text-lg">Select a conversation</p>
              <p className="text-text-light text-sm mt-1">
                Choose a conversation from the sidebar to start replying
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Whether to show avatar (only on first message in a sequence from same sender)
function shouldShowAvatar(messages: ChatMessage[], idx: number): boolean {
  const current = messages[idx]
  if (current.message_type === 'SYSTEM') return false
  const prev = messages[idx - 1]
  if (!prev) return true
  if (prev.message_type === 'SYSTEM') return true
  return prev.sender_type !== current.sender_type
}

// Avatar with initials and colored background
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initial = (name || 'G')[0].toUpperCase()
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  // Pick a color from the palette deterministically
  const colors = [
    'bg-indigo-500',
    'bg-pink-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-blue-500',
    'bg-rose-500',
    'bg-violet-500',
  ]
  const colorIdx = (name?.charCodeAt(0) || 0) % colors.length
  return (
    <div
      className={`${sz} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="bg-gray-100 text-text-light text-xs font-medium px-3 py-1 rounded-full">
        {label}
      </span>
    </div>
  )
}

// Session item in sidebar
function SessionItem({
  session,
  isActive,
  onClick,
}: {
  session: ChatSession
  isActive: boolean
  onClick: () => void
}) {
  const timeAgo = getTimeAgo(session.created_at)
  const name = session.customer_name || `Guest #${session.id}`

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl transition-colors duration-200 cursor-pointer ${
        isActive ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-text text-sm truncate">{name}</p>
            <span className="text-[11px] text-text-lighter flex-shrink-0">{timeAgo}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-xs text-text-light truncate">
              {LANGUAGE_LABELS[session.customer_language] || session.customer_language}
            </p>
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                session.status === 'OPEN'
                  ? 'bg-indigo-500'
                  : session.status === 'ASSIGNED'
                    ? 'bg-blue-400'
                    : 'bg-gray-300'
              }`}
            />
          </div>
        </div>
      </div>
    </button>
  )
}

// Admin message bubble
function AdminMessageBubble({
  message,
  customerName,
  showAvatar,
}: {
  message: ChatMessage
  customerName: string
  showAvatar: boolean
}) {
  const isStaff = message.sender_type === 'STAFF'
  const isSystem = message.message_type === 'SYSTEM'

  if (isSystem) {
    return <DateDivider label={message.original_message || ''} />
  }

  return (
    <div className={`flex ${isStaff ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {/* Customer avatar */}
      {!isStaff && (
        <div className="mr-2 mt-auto mb-1 self-end">
          {showAvatar ? (
            <Avatar name={customerName} size="sm" />
          ) : (
            <div className="w-8 h-8" aria-hidden="true" />
          )}
        </div>
      )}

      <div className="flex flex-col max-w-[60%]">
        <div
          className={`px-4 py-2.5 ${
            isStaff
              ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md'
              : 'bg-gray-100 text-text rounded-2xl rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.original_message}</p>
        </div>
        <p
          className={`text-[11px] text-text-lighter mt-1 ${
            isStaff ? 'text-right pr-1' : 'text-left pl-1'
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}
