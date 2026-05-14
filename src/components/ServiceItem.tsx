import type { ReactNode } from "react";

interface ServiceItemProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export function ServiceItem({ icon, label, onClick }: ServiceItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl p-1.5 transition-transform duration-150 active:scale-95"
      aria-label={label}
    >
      {/* Icon circle with shadow */}
      <div
        className="w-[68px] h-[68px] rounded-full bg-white flex items-center justify-center transition-shadow duration-200 group-hover:shadow-lg"
        style={{
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0, 0, 0, 0.04)",
        }}
      >
        {icon}
      </div>
      {/* Label text */}
      <span className="text-[11px] text-center text-gray-700 font-medium leading-tight max-w-[85px] min-h-[28px] flex items-start justify-center">
        {label}
      </span>
    </button>
  );
}
