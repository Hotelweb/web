import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHotels } from "../api";
import type { Hotel } from "../api";
import { HeroBanner } from "../components/HeroBanner";
import { HotelCard } from "../components/HotelCard";
import { ServicesGrid } from "../components/ServicesGrid";
import { ChatButton } from "../components/ChatButton";

export function HomePage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function loadHotels() {
      try {
        const data = await getHotels();
        setHotels(data);
      } catch (err) {
        console.error("Failed to load hotels:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHotels();
  }, []);

  const handleHotelClick = (hotel: Hotel) => {
    navigate(`/hotel/${hotel.slug}`);
  };

  const handleServiceClick = (service: string) => {
    console.log(`Service clicked: ${service}`);
  };

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{ backgroundColor: "#F5F0EB" }}
    >
      {/* Background beach image */}
      <div
        className="fixed top-0 right-0 w-2/5 h-full pointer-events-none hidden lg:block"
        aria-hidden="true"
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80')`,
            maskImage:
              "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex justify-center items-center h-full py-4 px-4">
        <div className="w-full max-w-[420px] h-full max-h-[750px] flex flex-col">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full">
            {/* Hero Banner */}
            <div className="relative flex-shrink-0">
              <HeroBanner />
            </div>

            {/* Hotel List or Default Card */}
            <div className="relative px-4 -mt-8 z-20 flex-shrink-0">
              {hotels.length > 0 ? (
                <div className="space-y-2">
                  {hotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      name={hotel.name}
                      address={hotel.address || ""}
                      onClick={() => handleHotelClick(hotel)}
                    />
                  ))}
                </div>
              ) : (
                <HotelCard
                  name="A25 Hotel - 684 Minh Khai"
                  address="684 Minh Khai Street, Vinh Tuy Ward, Hanoi City"
                  onClick={() => {}}
                />
              )}
            </div>

            {/* Services Grid */}
            <div className="flex-1 overflow-y-auto px-2 py-5 pb-6">
              <ServicesGrid onServiceClick={handleServiceClick} />
            </div>
          </div>
        </div>
      </div>

      <ChatButton onClick={() => {}} />
    </div>
  );
}
