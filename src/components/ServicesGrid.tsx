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

interface ServicesGridProps {
  onServiceClick?: (service: string) => void
}

export function ServicesGrid({ onServiceClick }: ServicesGridProps) {
  const services = [
    { icon: <TranslateIcon />, label: 'How to Translate' },
    { icon: <FrontOfficeIcon />, label: 'Front Office Services' },
    { icon: <RoomServiceIcon />, label: 'Room Service' },
    { icon: <RestaurantIcon />, label: 'Restaurant' },
    { icon: <InRoomDiningIcon />, label: 'In-room Dinning' },
    { icon: <SpecialOfferIcon />, label: 'Special Offer (Membership)' },
    { icon: <FacilitiesIcon />, label: 'Facilities' },
    { icon: <LaundryIcon />, label: 'Laundry Service' },
    { icon: <SpaIcon />, label: 'Spa' },
    { icon: <MotorbikeIcon />, label: 'Motorbike Rental' },
    {
      icon: <AirportShuttleIcon />,
      label: 'Airport shuttle, intercity transportation',
    },
    { icon: <TourTicketIcon />, label: 'Tour/Ticket' },
    { icon: <CustomerFeedbackIcon />, label: 'Customer Feedback' },
    { icon: <InRoomGuideIcon />, label: 'In-room facilities user guide' },
    { icon: <SocialMediaIcon />, label: 'Social Media' },
    { icon: <HotelInfoIcon />, label: 'Hotel information' },
    { icon: <HotelRulesIcon />, label: 'Hotel Rules' },
    { icon: <PetsIcon />, label: 'Pets' },
  ]

  return (
    <div
      className="grid grid-cols-3 sm:grid-cols-4 gap-y-5 gap-x-2 px-3"
      role="navigation"
      aria-label="Hotel services"
    >
      {services.map((service) => (
        <ServiceItem
          key={service.label}
          icon={service.icon}
          label={service.label}
          onClick={() => onServiceClick?.(service.label)}
        />
      ))}
    </div>
  )
}
