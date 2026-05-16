import type { HotelService } from '../api'
import { ServiceItem, type ServiceTone } from './ServiceItem'
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
  BarLoungeIcon,
  GymPoolIcon,
  HousekeepingIcon,
} from './icons/ServiceIcons'

const ICON_CLS = 'w-6 h-6'

interface IconStyle {
  icon: React.ReactNode
  tone: ServiceTone
}

// Map service titles to a paired icon + tone
const styleByTitle: Record<string, IconStyle> = {
  // Translation
  'Hướng dẫn dịch': { icon: <TranslateIcon className={ICON_CLS} />, tone: 'blue' },
  'How to Translate': { icon: <TranslateIcon className={ICON_CLS} />, tone: 'blue' },

  // Reception / front office
  'Lễ tân': { icon: <FrontOfficeIcon className={ICON_CLS} />, tone: 'green' },
  'Front Office Services': { icon: <FrontOfficeIcon className={ICON_CLS} />, tone: 'green' },

  // Room service
  'Dịch vụ phòng': { icon: <RoomServiceIcon className={ICON_CLS} />, tone: 'purple' },
  'Room Service': { icon: <RoomServiceIcon className={ICON_CLS} />, tone: 'purple' },

  // Housekeeping
  'Dọn phòng': { icon: <HousekeepingIcon className={ICON_CLS} />, tone: 'amber' },
  Housekeeping: { icon: <HousekeepingIcon className={ICON_CLS} />, tone: 'amber' },

  // Restaurant
  'Nhà hàng': { icon: <RestaurantIcon className={ICON_CLS} />, tone: 'red' },
  Restaurant: { icon: <RestaurantIcon className={ICON_CLS} />, tone: 'red' },

  // In room dining
  'Ăn tại phòng': { icon: <InRoomDiningIcon className={ICON_CLS} />, tone: 'orange' },
  'In-room Dining': { icon: <InRoomDiningIcon className={ICON_CLS} />, tone: 'orange' },
  'In-room Dinning': { icon: <InRoomDiningIcon className={ICON_CLS} />, tone: 'orange' },

  // Special offers
  'Ưu đãi đặc biệt': { icon: <SpecialOfferIcon className={ICON_CLS} />, tone: 'pink' },
  'Special Offer (Membership)': { icon: <SpecialOfferIcon className={ICON_CLS} />, tone: 'pink' },
  'Special Offer': { icon: <SpecialOfferIcon className={ICON_CLS} />, tone: 'pink' },

  // Bar
  'Bar & Lounge': { icon: <BarLoungeIcon className={ICON_CLS} />, tone: 'cyan' },
  Bar: { icon: <BarLoungeIcon className={ICON_CLS} />, tone: 'cyan' },

  // Spa
  Spa: { icon: <SpaIcon className={ICON_CLS} />, tone: 'emerald' },
  'Spa & Massage': { icon: <SpaIcon className={ICON_CLS} />, tone: 'emerald' },

  // Gym / pool
  'Gym & Pool': { icon: <GymPoolIcon className={ICON_CLS} />, tone: 'teal' },
  'Tiện ích': { icon: <FacilitiesIcon className={ICON_CLS} />, tone: 'indigo' },
  Facilities: { icon: <FacilitiesIcon className={ICON_CLS} />, tone: 'indigo' },

  // Motorbike
  'Thuê xe máy': { icon: <MotorbikeIcon className={ICON_CLS} />, tone: 'indigo' },
  'Motorbike Rental': { icon: <MotorbikeIcon className={ICON_CLS} />, tone: 'indigo' },

  // Airport shuttle
  'Đưa đón sân bay': { icon: <AirportShuttleIcon className={ICON_CLS} />, tone: 'sky' },
  'Airport Transfer': { icon: <AirportShuttleIcon className={ICON_CLS} />, tone: 'sky' },
  'Airport shuttle, intercity transportation': {
    icon: <AirportShuttleIcon className={ICON_CLS} />,
    tone: 'sky',
  },

  // Tour
  'Tour & Vé': { icon: <TourTicketIcon className={ICON_CLS} />, tone: 'violet' },
  'Tour/Ticket': { icon: <TourTicketIcon className={ICON_CLS} />, tone: 'violet' },
  'Beach Tour': { icon: <TourTicketIcon className={ICON_CLS} />, tone: 'violet' },

  // Laundry
  'Giặt ủi': { icon: <LaundryIcon className={ICON_CLS} />, tone: 'rose' },
  'Laundry Service': { icon: <LaundryIcon className={ICON_CLS} />, tone: 'rose' },

  // Feedback
  'Góp ý khách hàng': { icon: <CustomerFeedbackIcon className={ICON_CLS} />, tone: 'fuchsia' },
  'Customer Feedback': { icon: <CustomerFeedbackIcon className={ICON_CLS} />, tone: 'fuchsia' },

  // Hotel info
  'Thông tin khách sạn': { icon: <HotelInfoIcon className={ICON_CLS} />, tone: 'lime' },
  'Hotel information': { icon: <HotelInfoIcon className={ICON_CLS} />, tone: 'lime' },

  // Rules
  'Nội quy': { icon: <HotelRulesIcon className={ICON_CLS} />, tone: 'slate' },
  'Hotel Rules': { icon: <HotelRulesIcon className={ICON_CLS} />, tone: 'slate' },

  // Pets
  'Thú cưng': { icon: <PetsIcon className={ICON_CLS} />, tone: 'yellow' },
  Pets: { icon: <PetsIcon className={ICON_CLS} />, tone: 'yellow' },

  // Social
  'Mạng xã hội': { icon: <SocialMediaIcon className={ICON_CLS} />, tone: 'pink' },
  'Social Media': { icon: <SocialMediaIcon className={ICON_CLS} />, tone: 'pink' },

  // In-room guide
  'Hướng dẫn tiện ích': { icon: <InRoomGuideIcon className={ICON_CLS} />, tone: 'blue' },
  'In-room facilities user guide': {
    icon: <InRoomGuideIcon className={ICON_CLS} />,
    tone: 'blue',
  },
}

const fallbackTones: ServiceTone[] = [
  'blue',
  'green',
  'purple',
  'orange',
  'pink',
  'indigo',
  'teal',
  'amber',
]

function styleFor(title: string, idx: number): IconStyle {
  return (
    styleByTitle[title] ?? {
      icon: <HotelInfoIcon className={ICON_CLS} />,
      tone: fallbackTones[idx % fallbackTones.length],
    }
  )
}

interface HotelDetailServicesProps {
  services: HotelService[]
  onServiceClick?: (service: HotelService) => void
}

export function HotelDetailServices({ services, onServiceClick }: HotelDetailServicesProps) {
  return (
    <section aria-label="Hotel services">
      <h3 className="text-xl sm:text-2xl font-bold text-text tracking-tight mb-5">
        Dịch vụ khách sạn
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map((service, idx) => {
          const s = styleFor(service.title, idx)
          return (
            <ServiceItem
              key={service.id}
              icon={s.icon}
              label={service.title}
              description={service.description ?? undefined}
              tone={s.tone}
              onClick={() => onServiceClick?.(service)}
            />
          )
        })}
      </div>
    </section>
  )
}
