import { clearAuth, getToken } from '../lib/auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  // A 401 on any authenticated call means the token is gone or expired —
  // clear local state so the next render redirects to /login.
  if (res.status === 401 && token) {
    clearAuth()
  }

  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      const msg = (body as { message?: string | string[] })?.message
      detail = Array.isArray(msg) ? msg.join('; ') : (msg ?? '')
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail || `API Error: ${res.status} ${res.statusText}`)
  }
  // 204 No Content has no body
  if (res.status === 204) return undefined as T
  return res.json()
}

export interface Hotel {
  id: number
  name: string
  slug: string
  phone: string | null
  email: string | null
  address: string | null
  description: string | null
  logo_url: string | null
  banner_url: string | null
  qr_token: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ---- Hotel admins (per-hotel manager accounts) -------------------------

export interface HotelUser {
  id: number
  hotel_id: number
  email: string
  full_name: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateHotelInput {
  name: string
  phone?: string
  email?: string
  address?: string
  description?: string
  manager_email?: string
  manager_password?: string
  manager_name?: string
}

export interface CreateHotelResponse {
  hotel: Hotel
  qr_page_url: string
  manager: {
    id: number
    hotel_id: number
    email: string
    full_name: string
    is_active: boolean
    created_at: string
    default_password?: string
  }
}

export interface ServiceTranslation {
  id: number
  service_id: number
  language: string
  title: string
  description: string | null
}

export interface HotelService {
  id: number
  icon_url: string | null
  image_url: string | null
  sort_order: number
  title: string
  description: string
  language: string
  translations: ServiceTranslation[]
}

// ---- Chat types ----------------------------------------------------------

export type ChatSessionStatus = 'OPEN' | 'ASSIGNED' | 'BOOKED' | 'CLOSED'
export type MessageSenderType = 'CUSTOMER' | 'STAFF'
export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM' | 'ORDER'
export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
export type TranslationStatus = 'PENDING' | 'TRANSLATED' | 'FAILED' | 'SKIPPED'

export interface ChatSession {
  id: number
  hotel_id: number
  customer_token: string
  customer_language: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  customer_country: string | null
  room_number: string | null
  room_type: string | null
  check_in_date: string | null
  check_out_date: string | null
  guest_count: number | null
  initial_request: string | null
  status: ChatSessionStatus
  unread_count: number
  last_message_at: string | null
  closed_at: string | null
  created_at: string
}

export interface ChatMessage {
  id: number
  session_id: number
  sender_type: MessageSenderType
  message_type: MessageType
  source_language: string
  target_language: string | null
  original_message: string | null
  translated_message: string | null
  translation_status: TranslationStatus
  translation_provider: string | null
  translation_duration_ms: number | null
  image_url: string | null
  status: MessageStatus
  client_message_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface CreateSessionInput {
  hotel_id: number
  customer_language: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  customer_country?: string
  room_number?: string
  room_type?: string
  check_in_date?: string
  check_out_date?: string
  guest_count?: number
  initial_request?: string
}

// Hotel APIs
export const getHotels = () => fetchApi<Hotel[]>('/hotels')
export const getHotel = (id: number) => fetchApi<Hotel>(`/hotels/${id}`)
export const getHotelBySlug = (slug: string) => fetchApi<Hotel>(`/hotels/slug/${slug}`)
export const getHotelByQr = (qrToken: string) => fetchApi<Hotel>(`/hotels/qr/${qrToken}`)

export const createHotel = (data: CreateHotelInput) =>
  fetchApi<CreateHotelResponse>('/hotels', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const deleteHotel = (id: number) => fetchApi<void>(`/hotels/${id}`, { method: 'DELETE' })

// Hotel users (staff)
export const getHotelUsers = (hotelId: number) =>
  fetchApi<HotelUser[]>(`/hotel-users?hotel_id=${hotelId}`)

// Services APIs
export const getHotelServices = (hotelId: number, lang?: string) =>
  fetchApi<HotelService[]>(`/services/hotel/${hotelId}${lang ? `?lang=${lang}` : ''}`)

// Chat APIs
export const createChatSession = (data: CreateSessionInput) =>
  fetchApi<ChatSession>('/chat/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getChatSession = (id: number) => fetchApi<ChatSession>(`/chat/sessions/${id}`)

export const getChatSessionByToken = (token: string) =>
  fetchApi<ChatSession>(`/chat/sessions/token/${token}`)

export const getChatMessages = (sessionId: number) =>
  fetchApi<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`)

export const sendCustomerMessage = (
  sessionId: number,
  data: {
    message?: string
    source_language: string
    message_type?: 'TEXT' | 'IMAGE'
    image_url?: string
    client_message_id?: string
  },
) =>
  fetchApi<ChatMessage>(`/chat/sessions/${sessionId}/messages/customer`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const sendStaffMessage = (
  sessionId: number,
  userId: number,
  data: {
    message?: string
    source_language: string
    message_type?: 'TEXT' | 'IMAGE'
    image_url?: string
    client_message_id?: string
  },
) =>
  fetchApi<ChatMessage>(`/chat/sessions/${sessionId}/messages/staff/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateSessionStatus = (sessionId: number, status: ChatSessionStatus) =>
  fetchApi<ChatSession>(`/chat/sessions/${sessionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const markSessionRead = (sessionId: number, by: 'customer' | 'staff') =>
  fetchApi<{ updated: number }>(`/chat/sessions/${sessionId}/read?by=${by}`, {
    method: 'POST',
  })

export const getHotelSessions = (hotelId: number) =>
  fetchApi<ChatSession[]>(`/chat/hotel/${hotelId}/sessions`)

export const translateText = (text: string, source: string, target: string) =>
  fetchApi<{
    text: string
    status: 'success' | 'fallback' | 'error'
    provider: string
    durationMs: number
  }>(`/chat/translate`, {
    method: 'POST',
    body: JSON.stringify({ text, source, target }),
  })

// ---- Auth ----------------------------------------------------------------

export interface LoginInput {
  email: string
  password: string
  scope?: 'system' | 'hotel'
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    email: string
    full_name: string
    scope: 'system' | 'hotel'
    hotel_id?: number
    is_active: boolean
  }
}

export const login = (data: LoginInput) =>
  fetchApi<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getMe = () => fetchApi<LoginResponse['user']>('/auth/me')

export { API_BASE }
