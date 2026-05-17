import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getChatMessages, getHotel, getHotelSessions, markSessionRead } from '../api'
import type { ChatMessage, ChatSession, ChatSessionStatus, Hotel } from '../api'
import { useChatSocket } from '../hooks/useChatSocket'
import { getLanguage } from '../lib/languages'
import { UserMenu } from '../components/UserMenu'
import { CannedResponses } from '../components/chat/CannedResponses'
import { ConnectionBanner, ConnectionDot } from '../components/chat/ConnectionBanner'
import { GuestInfoPanel } from '../components/chat/GuestInfoPanel'
import { MessageBubble, type DisplayMessage } from '../components/chat/MessageBubble'
import { SkeletonList } from '../components/chat/SkeletonMessage'
import { TypingIndicator } from '../components/chat/TypingIndicator'
import {
  BellIcon,
  BellOffIcon,
  ImageIcon,
  MoreIcon,
  PaperclipIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  ServicesIcon,
  SmileIcon,
  TranslateBubbleIcon,
  VideoIcon,
  VolumeIcon,
  VolumeOffIcon,
} from '../components/icons/ServiceIcons'
import {
  playNotificationSound,
  requestNotificationPermission,
  showBrowserNotification,
} from '../lib/notifications'

const STAFF_USER_ID = 1
const ADMIN_LANG = 'vi'

type FilterKey = 'all' | 'active' | 'waiting' | 'booked' | 'closed'

const FILTERS: { key: FilterKey; label: string; statuses?: ChatSessionStatus[] }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang xử lý', statuses: ['ASSIGNED'] },
  { key: 'waiting', label: 'Đang chờ', statuses: ['OPEN'] },
  { key: 'booked', label: 'Đã đặt', statuses: ['BOOKED'] },
  { key: 'closed', label: 'Đã đóng', statuses: ['CLOSED'] },
]

export function AdminChatPage() {
  const { hotelId: hotelIdParam } = useParams<{ hotelId: string }>()
  const hotelId = Number(hotelIdParam)
  const navigate = useNavigate()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notifEnabled, setNotifEnabled] = useState<NotificationPermission>('default')
  const [guestTyping, setGuestTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeSessionIdRef = useRef<number | null>(null)

  // Keep the latest activeSession id in a ref so socket callbacks can read it
  // without re-binding listeners. Updated via effect to avoid mutating a ref
  // during render (React 19 rule).
  useEffect(() => {
    activeSessionIdRef.current = activeSession?.id ?? null
  }, [activeSession?.id])

  // ---------------------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hotelId) return
    let cancelled = false

    const load = async () => {
      try {
        const [h, s] = await Promise.all([getHotel(hotelId), getHotelSessions(hotelId)])
        if (cancelled) return
        setHotel(h)
        setSessions(s)
      } catch (err) {
        console.error('Failed to load admin dashboard:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [hotelId])

  // Sync the "notifications enabled" pill with the current browser permission.
  // We read it lazily in an effect (not initial state) so SSR is safe and we
  // don't read a global during render.
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    const sync = () => setNotifEnabled(Notification.permission)
    sync()
    // Permission can change in the browser settings while the tab is open.
    // Re-sync on window focus to catch this cheaply without a polling timer.
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  // ---------------------------------------------------------------------------
  // Realtime socket
  // ---------------------------------------------------------------------------
  const handleNewMessage = useCallback((msg: ChatMessage) => {
    if (msg.session_id !== activeSessionIdRef.current) return
    setMessages((prev) => {
      if (msg.client_message_id) {
        const idx = prev.findIndex(
          (m) => m._optimistic && m.client_message_id === msg.client_message_id,
        )
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = msg
          return next
        }
      }
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  const handleSessionUpdate = useCallback(
    (data: { sessionId: number; message: ChatMessage; session: ChatSession }) => {
      // Update sidebar list
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === data.sessionId)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = data.session
          // Move updated session to top
          next.sort((a, b) => {
            const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
            const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
            return tb - ta
          })
          return next
        }
        return [data.session, ...prev]
      })

      // Notify on incoming customer messages (not from self)
      if (
        data.message.sender_type === 'CUSTOMER' &&
        data.message.session_id !== activeSessionIdRef.current
      ) {
        if (soundEnabled) playNotificationSound()
        const guestName = data.session.customer_name || `Khách #${data.session.id}`
        const previewText =
          data.message.translated_message ?? data.message.original_message ?? '...'
        showBrowserNotification(`Tin nhắn mới · ${guestName}`, previewText, {
          tag: `chat-${data.session.id}`,
        })
      }
    },
    [soundEnabled],
  )

  const handleTyping = useCallback(
    (data: { sessionId: number; sender_type: 'CUSTOMER' | 'STAFF'; isTyping: boolean }) => {
      if (data.sessionId !== activeSessionIdRef.current) return
      if (data.sender_type === 'CUSTOMER') setGuestTyping(data.isTyping)
    },
    [],
  )

  const handleMessagesRead = useCallback(
    (data: { sessionId: number; by: 'customer' | 'staff' }) => {
      if (data.sessionId !== activeSessionIdRef.current) return
      if (data.by !== 'customer') return
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_type === 'STAFF' && !m.is_read
            ? { ...m, is_read: true, status: 'READ', read_at: new Date().toISOString() }
            : m,
        ),
      )
    },
    [],
  )

  const handleSessionUnreadUpdate = useCallback(
    (data: { sessionId: number; unread_count: number }) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === data.sessionId ? { ...s, unread_count: data.unread_count } : s)),
      )
    },
    [],
  )

  const handleSessionStatusChanged = useCallback(
    (data: { sessionId: number; session: ChatSession }) => {
      setSessions((prev) => prev.map((s) => (s.id === data.sessionId ? data.session : s)))
      if (activeSession?.id === data.sessionId) setActiveSession(data.session)
    },
    [activeSession?.id],
  )

  const {
    connection,
    sendMessage: socketSend,
    emitTyping,
    markRead,
  } = useChatSocket({
    sessionId: activeSession?.id ?? null,
    hotelId,
    role: 'staff',
    onNewMessage: handleNewMessage,
    onTyping: handleTyping,
    onMessagesRead: handleMessagesRead,
    onSessionUpdate: handleSessionUpdate,
    onSessionUnreadUpdate: handleSessionUnreadUpdate,
    onSessionStatusChanged: handleSessionStatusChanged,
  })

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, guestTyping])

  // Mark read whenever active session changes / new messages arrive.
  // Wrapped in async function so all setState calls happen after a microtask,
  // satisfying React 19's "no synchronous setState in effect" rule.
  useEffect(() => {
    if (!activeSession) return
    const hasUnread = messages.some(
      (m) => m.sender_type === 'CUSTOMER' && !m.is_read && m.message_type !== 'SYSTEM',
    )
    if (!hasUnread) return
    if (connection !== 'online') return

    let cancelled = false
    const run = async () => {
      try {
        markRead()
        await markSessionRead(activeSession.id, 'staff').catch(() => undefined)
        if (cancelled) return
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_type === 'CUSTOMER' && !m.is_read ? { ...m, is_read: true } : m,
          ),
        )
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSession.id ? { ...s, unread_count: 0 } : s)),
        )
      } catch (err) {
        console.error('Failed to mark messages read:', err)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [activeSession, messages, connection, markRead])

  // ---------------------------------------------------------------------------
  // Selecting a session
  // ---------------------------------------------------------------------------
  const handleSelectSession = useCallback(async (session: ChatSession) => {
    setActiveSession(session)
    setMessages([])
    setLoadingMessages(true)
    setGuestTyping(false)
    try {
      const msgs = await getChatMessages(session.id)
      setMessages(msgs)
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoadingMessages(false)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Sending
  // ---------------------------------------------------------------------------
  const performSend = useCallback(
    (text: string, opts?: { messageType?: 'TEXT' | 'IMAGE'; imageUrl?: string }) => {
      if (!activeSession) return
      const trimmed = text.trim()
      if (!trimmed && !opts?.imageUrl) return

      const clientId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const optimistic: DisplayMessage = {
        id: -Date.now(),
        session_id: activeSession.id,
        sender_type: 'STAFF',
        message_type: opts?.messageType ?? 'TEXT',
        source_language: ADMIN_LANG,
        target_language: activeSession.customer_language,
        original_message: trimmed || null,
        translated_message: null,
        translation_status: 'PENDING',
        translation_provider: null,
        translation_duration_ms: null,
        image_url: opts?.imageUrl ?? null,
        status: 'SENDING',
        client_message_id: clientId,
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
        _optimistic: true,
      }
      setMessages((prev) => [...prev, optimistic])

      socketSend({
        sessionId: activeSession.id,
        message: trimmed,
        source_language: ADMIN_LANG,
        sender_type: 'STAFF',
        sender_user_id: STAFF_USER_ID,
        client_message_id: clientId,
        message_type: opts?.messageType,
        image_url: opts?.imageUrl,
      })

      // If session was previously OPEN, optimistically mark assigned
      if (activeSession.status === 'OPEN') {
        setActiveSession({ ...activeSession, status: 'ASSIGNED' })
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSession.id ? { ...s, status: 'ASSIGNED' } : s)),
        )
      }

      window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.client_message_id === clientId && m._optimistic
              ? { ...m, _failed: true, _optimistic: false, status: 'FAILED' }
              : m,
          ),
        )
      }, 8000)
    },
    [activeSession, socketSend],
  )

  const handleSend = () => {
    performSend(input)
    setInput('')
    emitTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      performSend('', { messageType: 'IMAGE', imageUrl: dataUrl })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRetry = (msg: DisplayMessage) => {
    setMessages((prev) => prev.filter((m) => m.client_message_id !== msg.client_message_id))
    performSend(msg.original_message ?? '', {
      messageType: msg.message_type === 'IMAGE' ? 'IMAGE' : 'TEXT',
      imageUrl: msg.image_url ?? undefined,
    })
  }

  // Typing emit
  const typingTimerRef = useRef<number | null>(null)
  useEffect(() => {
    if (!activeSession) return
    if (input.trim().length === 0) {
      emitTyping(false)
      return
    }
    emitTyping(true)
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
    typingTimerRef.current = window.setTimeout(() => emitTyping(false), 1500)
    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
    }
  }, [input, activeSession, emitTyping])

  // ---------------------------------------------------------------------------
  // Filtering / search
  // ---------------------------------------------------------------------------
  const filteredSessions = useMemo(() => {
    let out = sessions
    const filterDef = FILTERS.find((f) => f.key === filter)
    if (filterDef?.statuses) {
      out = out.filter((s) => filterDef.statuses!.includes(s.status))
    }
    const q = search.trim().toLowerCase()
    if (q) {
      out = out.filter((s) => {
        const name = (s.customer_name ?? `Khách #${s.id}`).toLowerCase()
        const phone = (s.customer_phone ?? '').toLowerCase()
        const email = (s.customer_email ?? '').toLowerCase()
        const room = (s.room_number ?? '').toLowerCase()
        return name.includes(q) || phone.includes(q) || email.includes(q) || room.includes(q)
      })
    }
    return out
  }, [sessions, search, filter])

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: sessions.length,
      active: 0,
      waiting: 0,
      booked: 0,
      closed: 0,
    }
    for (const s of sessions) {
      if (s.status === 'OPEN') counts.waiting++
      else if (s.status === 'ASSIGNED') counts.active++
      else if (s.status === 'BOOKED') counts.booked++
      else if (s.status === 'CLOSED') counts.closed++
    }
    return counts
  }, [sessions])

  const totalUnread = useMemo(
    () => sessions.reduce((sum, s) => sum + (s.unread_count ?? 0), 0),
    [sessions],
  )

  // Tab title with unread count
  useEffect(() => {
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Khách sạn · Trò chuyện`
    } else {
      document.title = 'Khách sạn · Trò chuyện'
    }
  }, [totalUnread])

  // ---------------------------------------------------------------------------
  // Notifications & sound toggles
  // ---------------------------------------------------------------------------
  const toggleNotifications = async () => {
    const result = await requestNotificationPermission()
    setNotifEnabled(result)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-warm">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Đang tải bảng điều khiển…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background-warm overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[320px] bg-white border-r border-border-light flex flex-col flex-shrink-0">
        {/* Brand + actions */}
        <div className="px-4 pt-4 pb-3 border-b border-border-light flex flex-col gap-3">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => navigate(`/admin/${hotelId}/food-order`)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-medium text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 cursor-pointer transition-colors"
              title="Quản lý đặt đồ ăn & nước uống"
            >
              Đặt món
            </button>
            <button
              onClick={() => navigate(`/admin/${hotelId}/services`)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-medium text-text-muted bg-white border border-border-light hover:bg-emerald-50/60 hover:text-primary cursor-pointer transition-colors"
              title="Quản lý dịch vụ khách sạn"
            >
              <ServicesIcon className="w-3.5 h-3.5" />
              Dịch vụ
            </button>
            <UserMenu size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold text-text leading-tight">Hộp thư</h1>
              {hotel ? (
                <p className="text-[11.5px] text-text-light truncate mt-0.5">{hotel.name}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled((v) => !v)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                  soundEnabled
                    ? 'text-text-muted hover:bg-gray-100'
                    : 'text-text-lighter hover:bg-gray-100'
                }`}
                aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                {soundEnabled ? (
                  <VolumeIcon className="w-4 h-4" />
                ) : (
                  <VolumeOffIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={toggleNotifications}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                  notifEnabled === 'granted'
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-text-muted hover:bg-gray-100'
                }`}
                aria-label="Thông báo trình duyệt"
                title={
                  notifEnabled === 'granted' ? 'Thông báo đã bật' : 'Bật thông báo trình duyệt'
                }
              >
                {notifEnabled === 'granted' ? (
                  <BellIcon className="w-4 h-4" />
                ) : (
                  <BellOffIcon className="w-4 h-4" />
                )}
              </button>
              <button
                className="w-9 h-9 rounded-xl gradient-indigo text-white flex items-center justify-center hover:shadow-card transition-all duration-200 cursor-pointer"
                aria-label="Cuộc trò chuyện mới"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, phòng…"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white border border-border-light focus:border-indigo-300 transition-all placeholder:text-text-lighter"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none">
            {FILTERS.map((f) => {
              const count = filterCounts[f.key]
              const isActive = filter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                  {count > 0 ? (
                    <span
                      className={`text-[10.5px] font-bold rounded-full px-1.5 py-0 ${
                        isActive ? 'bg-white/25 text-white' : 'bg-white text-text-muted'
                      }`}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center text-text-lighter">
                <SearchIcon className="w-6 h-6" />
              </div>
              <p className="text-[13px] text-text-muted font-medium">
                {search ? 'Không có kết quả' : 'Chưa có cuộc trò chuyện'}
              </p>
              <p className="text-[11.5px] text-text-lighter mt-1">
                {search ? 'Thử từ khóa khác' : 'Đang chờ khách liên hệ'}
              </p>
            </div>
          ) : (
            <ul className="p-2 flex flex-col gap-1" role="list">
              {filteredSessions.map((session) => (
                <SessionListItem
                  key={session.id}
                  session={session}
                  isActive={activeSession?.id === session.id}
                  onClick={() => handleSelectSession(session)}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex min-w-0 bg-white">
        {activeSession ? (
          <>
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top bar */}
              <header className="px-5 py-3 border-b border-border-light flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={activeSession.customer_name || `Khách ${activeSession.id}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-text text-[15px] truncate">
                      {activeSession.customer_name || `Khách #${activeSession.id}`}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <ConnectionDot state={connection} />
                      <span className="text-[11.5px] text-text-light">
                        {connection === 'online'
                          ? 'Trực tuyến'
                          : connection === 'reconnecting'
                            ? 'Đang kết nối lại…'
                            : 'Mất kết nối'}
                      </span>
                      <span className="text-text-lighter text-xs">·</span>
                      <span className="text-[11.5px] text-text-light flex items-center gap-1">
                        <span aria-hidden>{getLanguage(activeSession.customer_language).flag}</span>
                        {getLanguage(activeSession.customer_language).nativeName}
                      </span>
                      {activeSession.room_number ? (
                        <>
                          <span className="text-text-lighter text-xs">·</span>
                          <span className="text-[11.5px] text-text-light">
                            Phòng {activeSession.room_number}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-text-muted">
                  <button
                    type="button"
                    onClick={() => setShowOriginal((v) => !v)}
                    className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12px] font-medium transition-colors duration-200 cursor-pointer ${
                      showOriginal
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-gray-50 text-text-muted hover:bg-gray-100'
                    }`}
                    aria-pressed={showOriginal}
                  >
                    <TranslateBubbleIcon className="w-4 h-4" />
                    {showOriginal ? 'Ẩn bản gốc' : 'Xem bản gốc'}
                  </button>
                  <button
                    className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                    aria-label="Gọi điện"
                  >
                    <PhoneIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                    aria-label="Gọi video"
                  >
                    <VideoIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                    aria-label="Tùy chọn"
                  >
                    <MoreIcon className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {/* Connection banner */}
              <ConnectionBanner
                state={connection}
                labels={{
                  offline: 'Mất kết nối — tin nhắn sẽ gửi khi kết nối lại',
                  reconnecting: 'Đang kết nối lại…',
                }}
              />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-3 bg-gradient-to-b from-white to-gray-50/40">
                {loadingMessages ? <SkeletonList /> : null}

                <DateDivider label="Hôm nay" />

                {messages.map((msg) => (
                  <MessageBubble
                    key={`${msg.id}_${msg.client_message_id ?? ''}`}
                    message={msg}
                    viewer="staff"
                    showOriginal={showOriginal}
                    labels={{
                      sending: 'Đang gửi',
                      sent: 'Đã gửi',
                      delivered: 'Đã chuyển',
                      read: 'Đã xem',
                      failed: 'Lỗi',
                      retry: 'Gửi lại',
                      showOriginal: 'Xem bản gốc',
                      hideOriginal: 'Ẩn bản gốc',
                      translating: 'Đang dịch…',
                      translationFailed: 'Không dịch được',
                      translatedBadge: 'Đã dịch',
                      you: 'Bạn',
                      staff: 'Nhân viên',
                    }}
                    onRetry={handleRetry}
                  />
                ))}

                {guestTyping ? (
                  <TypingIndicator
                    label={`${activeSession.customer_name || 'Khách'} đang nhập`}
                    variant="admin"
                  />
                ) : null}

                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="px-5 py-3 border-t border-border-light bg-white flex-shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex items-end gap-1.5">
                  <CannedResponses onSelect={(text) => setInput(text)} />
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-text-muted cursor-pointer flex-shrink-0 transition-colors duration-200"
                    aria-label="Đính kèm tệp"
                  >
                    <PaperclipIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-text-muted cursor-pointer flex-shrink-0 transition-colors duration-200"
                    aria-label="Đính kèm ảnh"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder={`Nhập tin nhắn (sẽ tự dịch sang ${
                        getLanguage(activeSession.customer_language).nativeName
                      })…`}
                      className="w-full max-h-[140px] resize-none px-4 py-2.5 rounded-2xl bg-gray-50 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white border border-border-light focus:border-indigo-300 transition-all placeholder:text-text-lighter pr-9"
                      style={{ minHeight: '40px' }}
                    />
                    <button
                      className="absolute right-2 bottom-1.5 w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center text-text-muted cursor-pointer"
                      aria-label="Thêm emoji"
                    >
                      <SmileIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl gradient-indigo text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:shadow-card-hover transition-all duration-200 flex-shrink-0 active:scale-95"
                    aria-label="Gửi tin nhắn"
                  >
                    <SendIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10.5px] text-text-lighter mt-2 px-1 flex items-center gap-1.5">
                  <TranslateBubbleIcon className="w-3 h-3" />
                  <span>
                    Tin nhắn của bạn sẽ tự động dịch sang{' '}
                    <strong className="text-text-muted">
                      {getLanguage(activeSession.customer_language).nativeName}
                    </strong>{' '}
                    cho khách
                  </span>
                </p>
              </div>
            </div>

            {/* Right sidebar */}
            <GuestInfoPanel session={activeSession} />
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function SessionListItem({
  session,
  isActive,
  onClick,
}: {
  session: ChatSession
  isActive: boolean
  onClick: () => void
}) {
  const lang = getLanguage(session.customer_language)
  const name = session.customer_name || `Khách #${session.id}`
  const timeAgo = formatRelative(session.last_message_at ?? session.created_at)
  const unread = session.unread_count ?? 0

  const statusTone =
    session.status === 'OPEN'
      ? 'bg-amber-400'
      : session.status === 'ASSIGNED'
        ? 'bg-blue-500'
        : session.status === 'BOOKED'
          ? 'bg-emerald-500'
          : 'bg-gray-300'

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
          isActive ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <Avatar name={name} size="sm" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${statusTone}`}
              aria-hidden
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-[13.5px] truncate ${
                  unread > 0 ? 'font-bold text-text' : 'font-semibold text-text'
                }`}
              >
                {name}
              </p>
              <span className="text-[10.5px] text-text-lighter flex-shrink-0">{timeAgo}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <p className="text-[11.5px] text-text-light truncate flex items-center gap-1">
                <span aria-hidden>{lang.flag}</span>
                {session.customer_country || lang.nativeName}
              </p>
              {unread > 0 ? (
                <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] inline-flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </button>
    </li>
  )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initial = (name || 'K').charAt(0).toUpperCase()
  const sz = size === 'sm' ? 'w-9 h-9 text-[13px]' : 'w-10 h-10 text-[14px]'
  const colors = [
    'bg-gradient-to-br from-indigo-500 to-purple-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-amber-500 to-orange-500',
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-blue-500 to-sky-500',
    'bg-gradient-to-br from-rose-500 to-red-500',
    'bg-gradient-to-br from-violet-500 to-fuchsia-500',
  ]
  const colorIdx = (name?.charCodeAt(0) ?? 0) % colors.length
  return (
    <div
      className={`${sz} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      aria-hidden
    >
      {initial}
    </div>
  )
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="bg-gray-100 text-text-light text-[11px] font-medium px-3 py-1 rounded-full">
        {label}
      </span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50/50">
      <div className="text-center px-6 max-w-sm">
        <div className="w-20 h-20 mx-auto mb-5 rounded-3xl gradient-indigo flex items-center justify-center shadow-elevated">
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
        <p className="text-text font-bold text-lg">Chọn một cuộc trò chuyện</p>
        <p className="text-text-light text-[13.5px] mt-1.5 leading-relaxed">
          Mọi tin nhắn từ khách sẽ được tự động dịch sang tiếng Việt. Bạn chỉ cần trả lời bằng tiếng
          Việt — chúng tôi sẽ dịch sang ngôn ngữ của khách.
        </p>
      </div>
    </div>
  )
}

function formatRelative(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'vừa xong'
  if (diffMins < 60) return `${diffMins} phút`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} giờ`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
