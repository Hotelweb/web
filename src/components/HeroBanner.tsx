import { QRCode } from "./QRCode";
import heroImage from "../assets/hero.png";

export function HeroBanner() {
  return (
    <div className="relative">
      {/* QR Code - positioned at top right corner, outside the main container */}
      <div className="absolute -top-2 -right-24 z-30">
        <QRCode />
      </div>

      {/* Hero Image Container */}
      <div className="relative h-44 overflow-hidden rounded-t-2xl">
        <img
          src={heroImage}
          alt="A25 Hotel Lobby - Elegant chandelier and luxurious interior"
          className="w-full h-full object-cover"
        />

        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

        {/* Welcome text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <p
            className="text-xl italic font-normal tracking-wide drop-shadow-md"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome to
          </p>
          <h1
            className="text-[20px] font-semibold mt-0.5 tracking-wide drop-shadow-md leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            A25 Hotel - 684 Minh Khai
          </h1>
        </div>

        {/* Pagination indicator dots */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}
