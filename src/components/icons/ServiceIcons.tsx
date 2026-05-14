// Service Icons for A25 Hotel Dashboard
// Using SVG icons to match the reference design exactly

export const TranslateIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g fill="#4A5D23" stroke="#4A5D23" strokeWidth="1">
      {/* Three people with document */}
      <circle cx="12" cy="16" r="4" />
      <path d="M6 30c0-4 3-7 6-7s6 3 6 7" fill="none" strokeWidth="1.5" />
      <circle cx="24" cy="20" r="3.5" />
      <path d="M18 32c0-3.5 3-6 6-6s6 2.5 6 6" fill="none" strokeWidth="1.5" />
      <circle cx="36" cy="16" r="4" />
      <path d="M30 30c0-4 3-7 6-7s6 3 6 7" fill="none" strokeWidth="1.5" />
      {/* Document icon */}
      <rect
        x="18"
        y="6"
        width="12"
        height="10"
        rx="1.5"
        fill="white"
        stroke="#4A5D23"
        strokeWidth="1.5"
      />
      <path d="M21 10h6M21 13h4" stroke="#4A5D23" strokeWidth="1" />
    </g>
  </svg>
);

export const FrontOfficeIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Person silhouette */}
      <circle cx="24" cy="14" r="6" />
      <path d="M12 40v-8c0-6.6 5.4-12 12-12s12 5.4 12 12v8" />
    </g>
  </svg>
);

export const RoomServiceIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Document with lines */}
      <rect x="8" y="8" width="18" height="24" rx="2" />
      <path d="M12 14h10M12 19h10M12 24h6" />
      {/* Coins stack */}
      <ellipse cx="34" cy="32" rx="8" ry="4" />
      <path d="M26 32v-4c0-2.2 3.6-4 8-4s8 1.8 8 4v4" />
      <ellipse cx="34" cy="28" rx="8" ry="4" />
    </g>
  </svg>
);

export const RestaurantIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#4A5D23" strokeWidth="1.5" fill="none">
      {/* Plate */}
      <circle cx="24" cy="28" r="12" />
      <circle cx="24" cy="28" r="8" />
      {/* Fork */}
      <path d="M14 8v10c0 2 1 3 2 3v14" />
      <path d="M12 8v6M14 8v6M16 8v6" />
      {/* Knife */}
      <path d="M34 8c2 0 3 4 3 8s-1 5-3 5v14" />
    </g>
  </svg>
);

export const InRoomDiningIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#4A5D23" strokeWidth="1.5" fill="none">
      {/* Cloche dome */}
      <path d="M8 34h32" />
      <path d="M10 34c0-12 6-20 14-20s14 8 14 20" />
      {/* Handle */}
      <ellipse cx="24" cy="12" rx="3" ry="2" />
      {/* Leaf decoration */}
      <path d="M24 14c-2 2-2 4 0 4s2-2 0-4" fill="#4A5D23" />
    </g>
  </svg>
);

export const SpecialOfferIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Megaphone */}
      <path d="M8 18v12l4 2v-16l-4 2z" fill="#1F2937" />
      <path d="M12 18h14l8-6v24l-8-6H12" />
      {/* Percent circle */}
      <circle
        cx="36"
        cy="14"
        r="6"
        fill="white"
        stroke="#4A5D23"
        strokeWidth="1.5"
      />
      <text x="32" y="17" fontSize="8" fill="#4A5D23" fontWeight="bold">
        %
      </text>
    </g>
  </svg>
);

export const FacilitiesIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#4A5D23" strokeWidth="1.5" fill="none">
      {/* Bowling ball */}
      <circle cx="20" cy="28" r="12" />
      <circle cx="16" cy="24" r="2" fill="#4A5D23" />
      <circle cx="22" cy="22" r="2" fill="#4A5D23" />
      <circle cx="18" cy="30" r="2" fill="#4A5D23" />
      {/* Bowling pin */}
      <path
        d="M36 12c-1.5 0-2.5 2-2.5 4s.5 3 1 4c.5 1 .5 2 .5 3 0 2 1 3 1 3h0s1-1 1-3c0-1 0-2 .5-3 .5-1 1-2 1-4s-1-4-2.5-4z"
        fill="white"
      />
      <ellipse cx="36" cy="26" rx="2" ry="1" />
    </g>
  </svg>
);

export const LaundryIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Washing machine */}
      <rect x="10" y="6" width="28" height="36" rx="3" />
      {/* Door */}
      <circle cx="24" cy="26" r="10" />
      <circle cx="24" cy="26" r="6" />
      {/* Controls */}
      <circle cx="16" cy="12" r="2" fill="#1F2937" />
      <circle cx="22" cy="12" r="2" fill="#1F2937" />
      <rect x="28" y="10" width="6" height="4" rx="1" />
    </g>
  </svg>
);

export const SpaIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#8B7355" strokeWidth="1.5" fill="none">
      {/* Lotus petals */}
      <path d="M24 36c-6 0-10-4-10-10 0-4 2-8 10-12 8 4 10 8 10 12 0 6-4 10-10 10z" />
      <path d="M24 24c-3 3-3 8 0 10" />
      <path d="M24 24c3 3 3 8 0 10" />
      {/* Side petals */}
      <path d="M14 28c-4-2-6-6-4-10 4 1 8 4 8 8" />
      <path d="M34 28c4-2 6-6 4-10-4 1-8 4-8 8" />
    </g>
  </svg>
);

export const MotorbikeIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#4A5D23" strokeWidth="1.5" fill="none">
      {/* Wheels */}
      <circle cx="12" cy="32" r="6" />
      <circle cx="36" cy="32" r="6" />
      {/* Frame */}
      <path d="M18 32h12" />
      <path d="M24 32l4-12h8l4 12" />
      <path d="M28 20l-12 6" />
      {/* Handlebar */}
      <path d="M10 24h10" />
      {/* Money/hand symbol */}
      <rect
        x="6"
        y="12"
        width="10"
        height="8"
        rx="1"
        fill="white"
        stroke="#4A5D23"
      />
      <path d="M9 16h4" />
    </g>
  </svg>
);

export const AirportShuttleIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Airplane body */}
      <path d="M24 8l-16 20h32L24 8z" />
      {/* Wings */}
      <path d="M8 28h32" />
      {/* Tail */}
      <path d="M24 8v-4" />
      {/* Info circle */}
      <circle cx="24" cy="22" r="4" />
      <path d="M24 20v4M24 25v0" fill="#1F2937" />
    </g>
  </svg>
);

export const TourTicketIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#4A5D23" strokeWidth="1.5" fill="none">
      {/* Globe */}
      <circle cx="24" cy="24" r="14" />
      <ellipse cx="24" cy="24" rx="6" ry="14" />
      <path d="M10 24h28" />
      <path d="M12 16h24" />
      <path d="M12 32h24" />
      {/* Location pin */}
      <circle cx="30" cy="18" r="3" fill="#4A5D23" />
    </g>
  </svg>
);

export const CustomerFeedbackIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Clipboard */}
      <rect x="10" y="8" width="20" height="28" rx="2" />
      <rect x="16" y="4" width="8" height="6" rx="1" />
      {/* Checkmarks */}
      <path d="M14 18l3 3 5-5" stroke="#4A5D23" strokeWidth="2" />
      <path d="M14 28h12" />
    </g>
  </svg>
);

export const InRoomGuideIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Remote/device */}
      <rect x="14" y="6" width="14" height="28" rx="3" />
      {/* Buttons */}
      <circle cx="21" cy="12" r="2" fill="#4A5D23" />
      <rect x="17" y="18" width="8" height="4" rx="1" />
      <rect x="17" y="24" width="8" height="4" rx="1" />
      {/* Signal waves */}
      <path d="M32 10c2 2 2 6 0 8" />
      <path d="M36 8c3 3 3 10 0 12" />
    </g>
  </svg>
);

export const SocialMediaIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#4A5D23" strokeWidth="1.5" fill="none">
      {/* Chat bubbles */}
      <path
        d="M8 12h18a4 4 0 014 4v8a4 4 0 01-4 4h-4l-4 4v-4H8a4 4 0 01-4-4v-8a4 4 0 014-4z"
        fill="white"
      />
      <path
        d="M18 20h20a4 4 0 014 4v8a4 4 0 01-4 4h-4l-4 4v-4h-12a4 4 0 01-4-4v-8a4 4 0 014-4z"
        fill="white"
      />
    </g>
  </svg>
);

export const HotelInfoIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Building */}
      <rect x="10" y="12" width="28" height="28" rx="2" />
      {/* Windows grid */}
      <rect x="14" y="16" width="6" height="6" />
      <rect x="14" y="26" width="6" height="6" />
      <rect x="28" y="16" width="6" height="6" />
      <rect x="28" y="26" width="6" height="6" />
      {/* Door */}
      <rect x="20" y="32" width="8" height="8" />
      {/* Roof detail */}
      <path d="M10 12l14-6 14 6" />
    </g>
  </svg>
);

export const HotelRulesIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#1F2937" strokeWidth="1.5" fill="none">
      {/* Document */}
      <rect x="10" y="6" width="22" height="32" rx="2" />
      {/* Lines */}
      <path d="M14 14h14" />
      <path d="M14 20h14" />
      <path d="M14 26h10" />
      {/* Bullet points */}
      <circle cx="14" cy="14" r="1" fill="#4A5D23" />
      <circle cx="14" cy="20" r="1" fill="#4A5D23" />
      <circle cx="14" cy="26" r="1" fill="#4A5D23" />
      {/* Bookmark */}
      <path d="M32 6v12l-4-3-4 3V6" fill="#4A5D23" stroke="#4A5D23" />
    </g>
  </svg>
);

export const PetsIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    <g stroke="#4A5D23" strokeWidth="1.5" fill="none">
      {/* Paw pad */}
      <ellipse cx="24" cy="30" rx="8" ry="6" fill="#4A5D23" />
      {/* Toe pads */}
      <ellipse cx="16" cy="20" rx="4" ry="5" fill="#4A5D23" />
      <ellipse cx="32" cy="20" rx="4" ry="5" fill="#4A5D23" />
      <ellipse cx="20" cy="14" rx="3" ry="4" fill="#4A5D23" />
      <ellipse cx="28" cy="14" rx="3" ry="4" fill="#4A5D23" />
    </g>
  </svg>
);

export const ChatIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6">
    <g stroke="#6B7280" strokeWidth="2" fill="none">
      {/* Back bubble */}
      <path
        d="M14 10h20a4 4 0 014 4v10a4 4 0 01-4 4h-6l-4 4v-4h-10a4 4 0 01-4-4V14a4 4 0 014-4z"
        fill="white"
      />
      {/* Front bubble */}
      <path
        d="M10 18h20a4 4 0 014 4v10a4 4 0 01-4 4h-4l-4 4v-4H10a4 4 0 01-4-4V22a4 4 0 014-4z"
        fill="white"
      />
    </g>
  </svg>
);

export const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path
      d="M9 18l6-6-6-6"
      stroke="#1F2937"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path
      d="M15 18l-6-6 6-6"
      stroke="#1F2937"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
