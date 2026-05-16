import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHotels } from '../api'
import type { Hotel } from '../api'
import { HeroBanner } from '../components/HeroBanner'
import { HotelCard } from '../components/HotelCard'
import { ServicesGrid } from '../components/ServicesGrid'
import { ChatButton } from '../components/ChatButton'
import { ChatWindow } from '../components/ChatWindow'
import { TopHeader } from '../components/TopHeader'

export function HomePage() {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [, setLoading] = useState(true)
  const [lang, setLang] = useState<'VN' | 'EN'>('VN')
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    async function loadHotels() {
      try {
        const data = await getHotels()
        setHotels(data)
      } catch (err) {
        console.error('Failed to load hotels:', err)
      } finally {
        setLoading(false)
      }
    }
    loadHotels()
  }, [])

  const handleHotelClick = (hotel: Hotel) => {
    navigate(`/hotel/${hotel.slug}`)
  }

  const handleServiceClick = (service: string) => {
    console.log(`Service clicked: ${service}`)
  }

  // Pick a hotel to open the chat with — first hotel by default
  const featuredHotel = hotels[0] ?? null

  return (
    <div className="min-h-screen bg-background-warm">
      {/* Top header with greeting + language switcher */}
      <TopHeader
        greeting={lang === 'VN' ? 'Xin chào!' : 'Hello!'}
        subtitle={
          lang === 'VN' ? 'Chào mừng quý khách đến với khách sạn' : 'Welcome to our hotel services'
        }
        lang={lang}
        onLangChange={setLang}
      />

      <main className="px-4 sm:px-8 lg:px-16 xl:px-20 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 sm:gap-10">
          {/* Hero Banner */}
          <HeroBanner />

          {/* Hotel List or Default Card */}
          <div>
            {hotels.length > 0 ? (
              <div className="space-y-3">
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    name={hotel.name}
                    address={hotel.address || ''}
                    onClick={() => handleHotelClick(hotel)}
                  />
                ))}
              </div>
            ) : (
              <HotelCard
                name="Grand Luxury Hotel & Spa"
                address="123 Đường ABC, Quận 1, TP.HCM"
                onClick={() => {}}
              />
            )}
          </div>

          {/* Services Grid */}
          <ServicesGrid onServiceClick={handleServiceClick} />
        </div>
      </main>

      {/* Floating chat button */}
      <ChatButton onClick={() => featuredHotel && setChatOpen(true)} badge={null} />

      {/* Chat Window */}
      {chatOpen && featuredHotel ? (
        <ChatWindow
          hotelId={featuredHotel.id}
          hotelName={featuredHotel.name}
          onClose={() => setChatOpen(false)}
        />
      ) : null}
    </div>
  )
}
