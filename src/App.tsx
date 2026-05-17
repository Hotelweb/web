import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { HotelDetailPage } from './pages/HotelDetailPage'
import { AdminChatPage } from './pages/AdminChatPage'
import { RootAdminPage } from './pages/RootAdminPage'
import { LoginPage } from './pages/LoginPage'
import { RequireAuth } from './components/RequireAuth'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotel/:slug" element={<HotelDetailPage />} />
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

export default App
