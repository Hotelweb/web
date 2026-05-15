import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { HotelDetailPage } from "./pages/HotelDetailPage";
import { AdminChatPage } from "./pages/AdminChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotel/:slug" element={<HotelDetailPage />} />
        <Route path="/admin/:hotelId/chat" element={<AdminChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
