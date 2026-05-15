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
    <div className="min-h-screen relative bg-background">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/[0.03] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015] hidden md:block"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1e3a8a 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Background beach image - desktop only */}
      <div
        className="fixed top-0 right-0 w-2/5 h-full pointer-events-none hidden xl:block"
        aria-hidden="true"
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80')`,
            maskImage:
              "linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* Main content - full width on mobile, constrained on desktop */}
      <div className="relative z-10 flex justify-center items-start md:items-center min-h-screen py-0 md:py-6 px-0 md:px-4">
        <div className="w-full max-w-full md:max-w-[480px] lg:max-w-[520px] min-h-screen md:min-h-0 md:h-auto md:max-h-[85vh] flex flex-col">
          <div className="bg-white md:glass-card md:rounded-3xl md:shadow-premium-lg md:border-white/60 overflow-hidden flex flex-col flex-1 md:flex-initial md:h-full">
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
            <div className="flex-1 overflow-y-auto px-2 py-5 pb-8">
              <ServicesGrid onServiceClick={handleServiceClick} />
            </div>
          </div>
        </div>
      </div>

      <ChatButton onClick={() => {}} />
    </div>
  );
}
