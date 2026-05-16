import type { ReactNode } from 'react'

interface ServiceItemProps {
  icon: ReactNode
  label: string
  onClick?: () => void
}

export function ServiceItem({ icon, label, onClick }: ServiceItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl p-2 transition-all duration-200 active:scale-95"
      aria-label={label}
    >
      {/* Icon circle with glass effect */}
      <div className="w-[68px] h-[68px] rounded-2xl bg-white flex items-center justify-center transition-all duration-300 group-hover:shadow-premium group-hover:-translate-y-1 border border-border-light shadow-[0_2px_8px_rgba(30,58,138,0.04)]">
        {icon}
      </div>
      {/* Label text */}
      <span className="text-[11px] text-center text-text-muted font-medium leading-tight max-w-[85px] min-h-[28px] flex items-start justify-center group-hover:text-primary transition-colors duration-200">
        {label}
      </span>
    </button>
  )
}
