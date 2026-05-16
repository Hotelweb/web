const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }
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

export interface ChatSession {
  id: number
  hotel_id: number
  customer_token: string
  customer_language: string
  customer_name: string | null
  status: string
  created_at: string
}

export interface ChatMessage {
  id: number
  session_id: number
  sender_type: 'CUSTOMER' | 'STAFF'
  message_type: 'TEXT' | 'IMAGE' | 'SYSTEM' | 'ORDER'
  source_language: string
  original_message: string | null
  translated_message: string | null
  is_read: boolean
  created_at: string
}

// Hotel APIs
export const getHotels = () => fetchApi<Hotel[]>('/hotels')
export const getHotel = (id: number) => fetchApi<Hotel>(`/hotels/${id}`)
export const getHotelBySlug = (slug: string) => fetchApi<Hotel>(`/hotels/slug/${slug}`)
export const getHotelByQr = (qrToken: string) => fetchApi<Hotel>(`/hotels/qr/${qrToken}`)

// Services APIs
export const getHotelServices = (hotelId: number, lang?: string) =>
  fetchApi<HotelService[]>(`/services/hotel/${hotelId}${lang ? `?lang=${lang}` : ''}`)

// Chat APIs
export const createChatSession = (data: {
  hotel_id: number
  customer_language: string
  customer_name?: string
}) =>
  fetchApi<ChatSession>('/chat/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getChatMessages = (sessionId: number) =>
  fetchApi<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`)

export const sendCustomerMessage = (
  sessionId: number,
  data: { message: string; source_language: string },
) =>
  fetchApi<ChatMessage>(`/chat/sessions/${sessionId}/messages/customer`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

// Admin Chat APIs
export const getHotelSessions = (hotelId: number) =>
  fetchApi<ChatSession[]>(`/chat/hotel/${hotelId}/sessions`)

export const sendStaffMessage = (
  sessionId: number,
  userId: number,
  data: { message: string; source_language: string },
) =>
  fetchApi<ChatMessage>(`/chat/sessions/${sessionId}/messages/staff/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
