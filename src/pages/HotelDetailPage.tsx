import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getHotelBySlug, getHotelServices } from "../api";
import type { Hotel, HotelService } from "../api";
import { ServicesGrid } from "../components/ServicesGrid";
import { HotelCard } from "../components/HotelCard";
import { ChatButton } from "../components/ChatButton";
import { ChatWindow } from "../components/ChatWindow";
import { HotelDetailServices } from "../components/HotelDetailServices";
import heroImage from "../assets/hero.png";

export function HotelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [services, setServices] = useState<HotelService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function loadHotel() {
      try {
        setLoading(true);
        const hotelData = await getHotelBySlug(slug!);
        setHotel(hotelData);

        const servicesData = await getHotelServices(hotelData.id, "en");
        setServices(servicesData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load hotel";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadHotel();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Loading hotel...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-text text-lg font-semibold mb-1">
            Hotel not found
          </p>
          <p className="text-text-muted text-sm">
            {error || "The link may be invalid or the hotel is inactive."}
          </p>
        </div>
      </div>
    );
  }

  const hotelPageUrl = `${window.location.origin}/hotel/${hotel.slug}`;

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

      {/* Background beach image */}
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

      {/* Main content - full width on mobile */}
      <div className="relative z-10 flex justify-center items-start md:items-center min-h-screen py-0 md:py-6 px-0 md:px-4">
        <div className="w-full max-w-full md:max-w-[480px] lg:max-w-[520px] min-h-screen md:min-h-0 md:h-auto md:max-h-[85vh] flex flex-col">
          <div className="bg-white md:glass-card md:rounded-3xl md:shadow-premium-lg md:border-white/60 overflow-hidden flex flex-col flex-1 md:flex-initial md:h-full">
            {/* Hero Banner with QR Code */}
            <div className="relative flex-shrink-0">
              {/* QR Code - hidden on mobile */}
              <div className="absolute -top-2 -right-24 z-30 hidden md:block">
                <div className="w-20 h-20 bg-white p-1.5 rounded-xl shadow-premium border border-border-light">
                  <QRCodeSVG
                    value={hotelPageUrl}
                    size={68}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1e3a8a"
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative h-52 md:h-48 overflow-hidden md:rounded-t-3xl">
                <img
                  src={hotel.banner_url || heroImage}
                  alt={`${hotel.name} - Hotel banner`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary-dark/50" />
                <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                  <p
                    className="text-lg italic font-normal tracking-widest drop-shadow-lg opacity-90"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Welcome to
                  </p>
                  <h1
                    className="text-[22px] font-bold mt-1 tracking-wide drop-shadow-lg leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {hotel.name}
                  </h1>
                  <div className="mt-3 w-12 h-[2px] bg-accent rounded-full opacity-80" />
                </div>

                {/* Pagination dots */}
                <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white shadow-sm ring-1 ring-white/30" />
                </div>
              </div>
            </div>

            {/* Hotel Info Card */}
            <div className="relative px-4 -mt-8 z-20 flex-shrink-0">
              <HotelCard
                name={hotel.name}
                address={hotel.address || ""}
                onClick={() => {}}
              />
            </div>

            {/* Services Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto px-2 py-5 pb-8">
              {services.length > 0 ? (
                <HotelDetailServices services={services} />
              ) : (
                <ServicesGrid onServiceClick={() => {}} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <ChatButton onClick={() => setShowChat(true)} />

      {/* Chat Window */}
      {showChat && (
        <ChatWindow
          hotelId={hotel.id}
          hotelName={hotel.name}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
