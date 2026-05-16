import { ArrowRightIcon } from './icons/ServiceIcons'

interface HotelCardProps {
  name: string
  address: string
  onClick?: () => void
}

export function HotelCard({ name, address, onClick }: HotelCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={`View details for ${name}`}
    >
      <div className="text-left flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Gold accent dot */}
          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
          <h2 className="font-bold text-text text-[14px] leading-tight truncate">{name}</h2>
        </div>
        <p className="text-text-muted text-[12px] mt-1 leading-snug pl-4">{address}</p>
      </div>
      <div className="flex-shrink-0 ml-3 w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center transition-colors duration-200 group-hover:bg-primary/10">
        <ArrowRightIcon />
      </div>
    </button>
  )
}
