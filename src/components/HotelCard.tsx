import { ArrowRightIcon } from "./icons/ServiceIcons";

interface HotelCardProps {
  name: string;
  address: string;
  onClick?: () => void;
}

export function HotelCard({ name, address, onClick }: HotelCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-md p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      }}
      aria-label={`View details for ${name}`}
    >
      <div className="text-left flex-1 min-w-0">
        <h2 className="font-bold text-gray-900 text-[14px] leading-tight">
          {name}
        </h2>
        <p className="text-gray-500 text-[12px] mt-0.5 leading-snug">
          {address}
        </p>
      </div>
      <div className="flex-shrink-0 ml-2">
        <ArrowRightIcon />
      </div>
    </button>
  );
}
