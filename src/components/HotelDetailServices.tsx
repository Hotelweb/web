import type { HotelService } from '../api'
import { ServiceItem } from './ServiceItem'
import {
  TranslateIcon,
  FrontOfficeIcon,
  RoomServiceIcon,
  RestaurantIcon,
  InRoomDiningIcon,
  SpecialOfferIcon,
  FacilitiesIcon,
  LaundryIcon,
  SpaIcon,
  MotorbikeIcon,
  AirportShuttleIcon,
  TourTicketIcon,
  CustomerFeedbackIcon,
  InRoomGuideIcon,
  SocialMediaIcon,
  HotelInfoIcon,
  HotelRulesIcon,
  PetsIcon,
} from './icons/ServiceIcons'

// Map service titles to icons
const iconMap: Record<string, React.ReactNode> = {
  'How to Translate': <TranslateIcon />,
  'Front Office Services': <FrontOfficeIcon />,
  'Room Service': <RoomServiceIcon />,
  Restaurant: <RestaurantIcon />,
  'In-room Dinning': <InRoomDiningIcon />,
  'In-room Dining': <InRoomDiningIcon />,
  'Special Offer (Membership)': <SpecialOfferIcon />,
  'Special Offer': <SpecialOfferIcon />,
  Facilities: <FacilitiesIcon />,
  'Laundry Service': <LaundryIcon />,
  Spa: <SpaIcon />,
  'Spa & Massage': <SpaIcon />,
  'Motorbike Rental': <MotorbikeIcon />,
  'Airport shuttle, intercity transportation': <AirportShuttleIcon />,
  'Airport Transfer': <AirportShuttleIcon />,
  'Tour/Ticket': <TourTicketIcon />,
  'Beach Tour': <TourTicketIcon />,
  'Customer Feedback': <CustomerFeedbackIcon />,
  'In-room facilities user guide': <InRoomGuideIcon />,
  'Social Media': <SocialMediaIcon />,
  'Hotel information': <HotelInfoIcon />,
  'Hotel Rules': <HotelRulesIcon />,
  Pets: <PetsIcon />,
}

// Default icon for services without a matching icon
function DefaultServiceIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
      <g stroke="#1E3A8A" strokeWidth="1.5" fill="none">
        <circle cx="24" cy="24" r="14" />
        <path d="M24 16v8l5 5" />
      </g>
    </svg>
  )
}

interface HotelDetailServicesProps {
  services: HotelService[]
}

export function HotelDetailServices({ services }: HotelDetailServicesProps) {
  return (
    <div
      className="grid grid-cols-3 sm:grid-cols-4 gap-y-5 gap-x-2 px-3"
      role="navigation"
      aria-label="Hotel services"
    >
      {services.map((service) => {
        const icon = iconMap[service.title] || <DefaultServiceIcon />
        return (
          <ServiceItem
            key={service.id}
            icon={icon}
            label={service.title}
            onClick={() => console.log(`Service clicked: ${service.title}`)}
          />
        )
      })}
    </div>
  )
}
