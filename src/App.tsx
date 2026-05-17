import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { HotelDetailPage } from './pages/HotelDetailPage'
import { AdminChatPage } from './pages/AdminChatPage'
import { RootAdminPage } from './pages/RootAdminPage'
import { LoginPage } from './pages/LoginPage'
import { HotelServicesAdminPage } from './pages/HotelServicesAdminPage'
import { FoodOrderPage } from './pages/FoodOrderPage'
import { FoodOrderAdminPage } from './pages/FoodOrderAdminPage'
import { RequireAuth } from './components/RequireAuth'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotel/:slug" element={<HotelDetailPage />} />
        <Route path="/hotel/:slug/order/:serviceId" element={<FoodOrderPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth scopes={['system']}>
              <RootAdminPage />
            </RequireAuth>
          }
        />
        <Route path="/admin/:hotelId/chat" element={<AdminChatRoute />} />
        <Route path="/admin/:hotelId/services" element={<HotelServicesAdminRoute />} />
        <Route path="/admin/:hotelId/food-order" element={<FoodOrderAdminRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

/**
 * AdminChatPage uses :hotelId from the URL, so we read it here and feed it
 * into RequireAuth. System admins always pass; hotel users must match the
 * specific hotel they belong to.
 */
function AdminChatRoute() {
  const { hotelId } = useParams<{ hotelId: string }>()
  const parsed = hotelId ? Number(hotelId) : undefined
  return (
    <RequireAuth scopes={['system', 'hotel']} hotelId={parsed}>
      <AdminChatPage />
    </RequireAuth>
  )
}

/**
 * Same pattern as AdminChatRoute — read the hotel id from the URL and gate
 * access. System admins manage any hotel's services; hotel admins are pinned
 * to their own hotel.
 */
function HotelServicesAdminRoute() {
  const { hotelId } = useParams<{ hotelId: string }>()
  const parsed = hotelId ? Number(hotelId) : undefined
  return (
    <RequireAuth scopes={['system', 'hotel']} hotelId={parsed}>
      <HotelServicesAdminPage />
    </RequireAuth>
  )
}

function FoodOrderAdminRoute() {
  const { hotelId } = useParams<{ hotelId: string }>()
  const parsed = hotelId ? Number(hotelId) : undefined
  return (
    <RequireAuth scopes={['system', 'hotel']} hotelId={parsed}>
      <FoodOrderAdminPage />
    </RequireAuth>
  )
}

export default App
