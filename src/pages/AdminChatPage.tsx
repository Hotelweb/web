import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { getHotel, getHotelSessions, getChatMessages, sendStaffMessage } from '../api'
import type { Hotel, ChatSession, ChatMessage } from '../api'

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
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [hotelId, activeSession])

  useEffect(() => {
    if (!socket || !activeSession) return
    socket.emit('joinSession', { sessionId: activeSession.id })
  }, [socket, activeSession])

  useEffect(() => {
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
  }, [socket])

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

    if (socket?.connected) {
      socket.emit('sendMessage', {
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - Sessions List */}
      <aside
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-white border-r border-border flex flex-col overflow-hidden flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-text text-sm truncate">{hotel?.name || 'Hotel'}</h1>
              <p className="text-xs text-text-muted">Chat Management</p>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-background flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-text-light"
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
              <p className="text-sm text-text-muted">No conversations yet</p>
              <p className="text-xs text-text-light mt-1">
                Waiting for customers to start chatting
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {sessions.map((session) => (
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
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-border flex items-center px-4 gap-3 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-xl hover:bg-background flex items-center justify-center transition-colors duration-200 cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          {activeSession ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
                {(activeSession.customer_name || 'G')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text text-sm truncate">
                  {activeSession.customer_name || `Guest #${activeSession.id}`}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">
                    {LANGUAGE_LABELS[activeSession.customer_language] ||
                      activeSession.customer_language}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-medium ${
                      activeSession.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700'
                        : activeSession.status === 'ASSIGNED'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-text-muted'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeSession.status === 'OPEN'
                          ? 'bg-emerald-500'
                          : activeSession.status === 'ASSIGNED'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                      }`}
                    />
                    {activeSession.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-text-muted text-sm">Select a conversation</p>
          )}
        </header>

        {/* Messages Area */}
        {activeSession ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50">
              {messages.map((msg) => (
                <AdminMessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-border p-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-3 rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white border border-transparent focus:border-primary/20 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="w-11 h-11 rounded-xl gradient-primary text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:shadow-premium transition-all duration-200 shadow-sm"
                  aria-label="Send message"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white shadow-premium flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-primary/20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path
                    d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M8 10h8M8 14h5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-text font-medium">No conversation selected</p>
              <p className="text-text-muted text-sm mt-1">
                Choose a conversation from the sidebar to start replying
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Session Item Component
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

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 hover:bg-background transition-colors duration-200 cursor-pointer ${
        isActive ? 'bg-primary/[0.04] border-l-3 border-l-primary' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
          {(session.customer_name || 'G')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-text text-sm truncate">
              {session.customer_name || `Guest #${session.id}`}
            </p>
            <span className="text-[11px] text-text-light flex-shrink-0">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-muted truncate">
              {LANGUAGE_LABELS[session.customer_language] || session.customer_language}
            </span>
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                session.status === 'OPEN'
                  ? 'bg-emerald-400'
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

// Admin Message Bubble
function AdminMessageBubble({ message }: { message: ChatMessage }) {
  const isStaff = message.sender_type === 'STAFF'
  const isSystem = message.message_type === 'SYSTEM'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-white rounded-full px-4 py-1.5 shadow-sm border border-border-light">
          <p className="text-xs text-text-muted text-center">{message.original_message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
      {!isStaff && (
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-semibold mr-2 flex-shrink-0 mt-1 shadow-sm">
          G
        </div>
      )}
      <div
        className={`max-w-[65%] rounded-2xl px-4 py-3 ${
          isStaff
            ? 'gradient-primary text-white rounded-br-lg shadow-sm'
            : 'bg-white text-text rounded-bl-lg shadow-sm border border-border-light'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.original_message}</p>
        <p className={`text-[10px] mt-1.5 ${isStaff ? 'text-white/60' : 'text-text-light'}`}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

// Helper
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
