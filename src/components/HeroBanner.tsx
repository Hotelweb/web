import { QRCode } from "./QRCode";
import heroImage from "../assets/hero.png";

export function HeroBanner() {
  return (
    <div className="relative">
      {/* QR Code - hidden on mobile */}
      <div className="absolute -top-2 -right-24 z-30 hidden md:block">
        <QRCode />
      </div>

      {/* Hero Image Container */}
      <div className="relative h-52 md:h-48 overflow-hidden md:rounded-t-3xl">
        <img
          src={heroImage}
          alt="A25 Hotel Lobby - Elegant chandelier and luxurious interior"
          className="w-full h-full object-cover"
        />

        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary-dark/50" />

        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />

        {/* Welcome text overlay */}
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
            A25 Hotel - 684 Minh Khai
          </h1>
          <div className="mt-3 w-12 h-[2px] bg-accent rounded-full opacity-80" />
        </div>

        {/* Pagination indicator dots */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white shadow-sm ring-1 ring-white/30" />
        </div>
      </div>
    </div>
  );
}
