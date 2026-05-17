import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getHotelBySlug } from '../api'
import type { Hotel } from '../api'
import { TopHeader } from '../components/TopHeader'
import {
  BackArrowIcon,
  CheckIcon,
  ClockIcon,
  InRoomDiningIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
} from '../components/icons/ServiceIcons'

type Lang = 'VN' | 'EN'

interface MenuItem {
  id: string
  category: string
  nameVi: string
  nameEn: string
  descriptionVi: string
  descriptionEn: string
  price: number
  available: string
  accent: string
}

const categories = [
  { key: 'all', labelVi: 'Tất cả', labelEn: 'All' },
  { key: 'breakfast', labelVi: 'Bữa sáng', labelEn: 'Breakfast' },
  { key: 'main', labelVi: 'Món chính', labelEn: 'Main' },
  { key: 'drink', labelVi: 'Đồ uống', labelEn: 'Drinks' },
  { key: 'dessert', labelVi: 'Tráng miệng', labelEn: 'Dessert' },
]

const sampleMenu: MenuItem[] = [
  {
    id: 'pho-bo',
    category: 'breakfast',
    nameVi: 'Phở bò truyền thống',
    nameEn: 'Traditional Beef Pho',
    descriptionVi: 'Nước dùng bò 8 giờ, bánh phở tươi, rau thơm',
    descriptionEn: '8-hour beef broth, fresh rice noodles, herbs',
    price: 120000,
    available: '15-20 min',
    accent: 'from-orange-100 to-amber-50 text-orange-700',
  },
  {
    id: 'banh-mi',
    category: 'breakfast',
    nameVi: 'Bánh mì trứng ốp la',
    nameEn: 'Omelette Banh Mi',
    descriptionVi: 'Bánh mì giòn, trứng ốp la, pate, rau ngâm',
    descriptionEn: 'Crispy baguette, fried egg, pate, pickles',
    price: 85000,
    available: '10-15 min',
    accent: 'from-yellow-100 to-orange-50 text-yellow-700',
  },
  {
    id: 'club-sandwich',
    category: 'main',
    nameVi: 'Club sandwich',
    nameEn: 'Club Sandwich',
    descriptionVi: 'Gà nướng, bacon, trứng, khoai tây chiên',
    descriptionEn: 'Grilled chicken, bacon, egg, french fries',
    price: 160000,
    available: '15-20 min',
    accent: 'from-lime-100 to-emerald-50 text-lime-700',
  },
  {
    id: 'com-ga',
    category: 'main',
    nameVi: 'Cơm gà Hội An',
    nameEn: 'Hoi An Chicken Rice',
    descriptionVi: 'Cơm nghệ, gà xé, rau răm, nước mắm gừng',
    descriptionEn: 'Turmeric rice, shredded chicken, herbs, ginger fish sauce',
    price: 145000,
    available: '20-25 min',
    accent: 'from-amber-100 to-yellow-50 text-amber-700',
  },
  {
    id: 'salmon',
    category: 'main',
    nameVi: 'Cá hồi áp chảo',
    nameEn: 'Pan-seared Salmon',
    descriptionVi: 'Cá hồi Na Uy, rau củ nướng, sốt chanh bơ',
    descriptionEn: 'Norwegian salmon, grilled vegetables, lemon butter sauce',
    price: 260000,
    available: '25-30 min',
    accent: 'from-rose-100 to-orange-50 text-rose-700',
  },
  {
    id: 'lotus-tea',
    category: 'drink',
    nameVi: 'Trà sen Tây Hồ',
    nameEn: 'West Lake Lotus Tea',
    descriptionVi: 'Trà sen ấm hoặc đá, phục vụ cùng mứt gừng',
    descriptionEn: 'Hot or iced lotus tea, served with ginger jam',
    price: 45000,
    available: '5-10 min',
    accent: 'from-teal-100 to-cyan-50 text-teal-700',
  },
  {
    id: 'ca-phe',
    category: 'drink',
    nameVi: 'Cà phê sữa đá',
    nameEn: 'Vietnamese Iced Coffee',
    descriptionVi: 'Cà phê phin, sữa đặc, đá viên',
    descriptionEn: 'Phin coffee, condensed milk, ice',
    price: 55000,
    available: '5-10 min',
    accent: 'from-stone-100 to-amber-50 text-stone-700',
  },
  {
    id: 'fruit',
    category: 'dessert',
    nameVi: 'Trái cây theo mùa',
    nameEn: 'Seasonal Fruit Plate',
    descriptionVi: 'Trái cây tươi cắt sẵn, dùng kèm sữa chua',
    descriptionEn: 'Fresh sliced fruit, served with yogurt',
    price: 90000,
    available: '10-15 min',
    accent: 'from-pink-100 to-red-50 text-pink-700',
  },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)

export function InRoomDiningPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('VN')
  const [activeCategory, setActiveCategory] = useState('all')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [customerName, setCustomerName] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    async function loadHotel() {
      try {
        setLoading(true)
        const hotelData = await getHotelBySlug(slug!)
        setHotel(hotelData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load hotel'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadHotel()
  }, [slug])

  const filteredMenu = useMemo(
    () =>
      activeCategory === 'all'
        ? sampleMenu
        : sampleMenu.filter((item) => item.category === activeCategory),
    [activeCategory],
  )

  const selectedItems = useMemo(
    () =>
      sampleMenu
        .map((item) => ({ item, quantity: quantities[item.id] ?? 0 }))
        .filter(({ quantity }) => quantity > 0),
    [quantities],
  )

  const subtotal = selectedItems.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0)
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.05) : 0
  const total = subtotal + serviceFee
  const itemCount = selectedItems.reduce((sum, { quantity }) => sum + quantity, 0)

  const copy = {
    title: lang === 'VN' ? 'Ăn tại phòng' : 'In-room Dinning',
    subtitle:
      lang === 'VN'
        ? 'Chọn món yêu thích, nhập số phòng và gửi yêu cầu phục vụ.'
        : 'Select dishes, enter your room details, and send your room order.',
    menu: lang === 'VN' ? 'Menu món ăn' : 'Food menu',
    order: lang === 'VN' ? 'Đơn order' : 'Order form',
    empty: lang === 'VN' ? 'Chưa chọn món nào' : 'No items selected',
    subtotal: lang === 'VN' ? 'Tạm tính' : 'Subtotal',
    serviceFee: lang === 'VN' ? 'Phí phục vụ 5%' : 'Service fee 5%',
    total: lang === 'VN' ? 'Tổng cộng' : 'Total',
    submit: lang === 'VN' ? 'Gửi order' : 'Send order',
    name: lang === 'VN' ? 'Tên khách' : 'Guest name',
    room: lang === 'VN' ? 'Số phòng' : 'Room number',
    phone: lang === 'VN' ? 'Số điện thoại' : 'Phone number',
    note: lang === 'VN' ? 'Ghi chú' : 'Note',
    required:
      lang === 'VN' ? 'Vui lòng chọn món và nhập số phòng.' : 'Select items and enter room number.',
  }

  const updateQuantity = (itemId: string, nextQuantity: number) => {
    setSubmittedRef(null)
    setQuantities((current) => {
      const next = { ...current }
      if (nextQuantity <= 0) {
        delete next[itemId]
      } else {
        next[itemId] = nextQuantity
      }
      return next
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!roomNumber.trim() || itemCount === 0) {
      setSubmittedRef(copy.required)
      return
    }

    setSubmittedRef(`IRD-${hotel?.id ?? 'A25'}-${Date.now().toString().slice(-5)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-warm">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-warm">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
            <InRoomDiningIcon className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-text text-lg font-semibold mb-1">Menu not found</p>
          <p className="text-text-muted text-sm">
            {error || 'The hotel menu link may be invalid.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background-warm ${itemCount > 0 ? 'pb-24 lg:pb-0' : ''}`}>
      <TopHeader greeting={copy.title} subtitle={hotel.name} lang={lang} onLangChange={setLang} />

      <main className="px-3 py-5 sm:px-8 sm:py-12 lg:px-16 xl:px-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-5 sm:gap-8">
          <button
            type="button"
            onClick={() => navigate(`/hotel/${hotel.slug}`)}
            className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors sm:text-sm"
          >
            <BackArrowIcon className="w-4 h-4" />
            {lang === 'VN' ? 'Quay lại dịch vụ khách sạn' : 'Back to hotel services'}
          </button>

          <section className="relative overflow-hidden rounded-2xl bg-primary text-white shadow-elevated sm:rounded-3xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.35),transparent_36%),linear-gradient(135deg,rgba(45,80,22,1),rgba(31,58,15,1))]" />
            <div className="relative grid gap-4 p-4 sm:gap-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-medium text-white/90 sm:mb-4 sm:text-sm">
                  <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  07:00 - 22:30
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">{copy.title}</h2>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-white/78 sm:mt-3 sm:text-base sm:leading-7">
                  {copy.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm sm:gap-3">
                <div className="rounded-xl bg-white/12 p-3 sm:rounded-2xl sm:p-4">
                  <p className="text-white/65">{lang === 'VN' ? 'Thời gian' : 'Delivery'}</p>
                  <p className="mt-1 whitespace-nowrap text-base font-bold sm:text-xl">15-30 min</p>
                </div>
                <div className="rounded-xl bg-white/12 p-3 sm:rounded-2xl sm:p-4">
                  <p className="text-white/65">{lang === 'VN' ? 'Phục vụ' : 'Service'}</p>
                  <p className="mt-1 text-base font-bold sm:text-xl">5%</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <section aria-label={copy.menu}>
              <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text tracking-tight sm:text-2xl">
                    {copy.menu}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-text-light sm:text-sm">
                    {lang === 'VN'
                      ? 'Món mẫu được chọn lọc cho phục vụ tại phòng.'
                      : 'Sample dishes curated for in-room service.'}
                  </p>
                </div>
                <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
                  {categories.map((category) => (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => setActiveCategory(category.key)}
                      className={`h-10 flex-shrink-0 rounded-full border px-4 text-sm font-semibold leading-none shadow-soft transition-colors ${
                        activeCategory === category.key
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-white text-text-muted hover:text-text'
                      }`}
                    >
                      {lang === 'VN' ? category.labelVi : category.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                {filteredMenu.map((item) => {
                  const quantity = quantities[item.id] ?? 0
                  return (
                    <article key={item.id} className="glass-card rounded-2xl p-3 sm:p-4">
                      <div
                        className={`mb-3 flex h-20 items-center justify-center rounded-xl bg-gradient-to-br sm:mb-4 sm:h-28 sm:rounded-2xl ${item.accent}`}
                      >
                        <InRoomDiningIcon className="w-9 h-9 sm:w-12 sm:h-12" />
                      </div>
                      <div className="flex flex-col sm:min-h-[116px]">
                        <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between min-[380px]:gap-3">
                          <div className="min-w-0">
                            <h4 className="text-[15px] font-semibold leading-tight text-text">
                              {lang === 'VN' ? item.nameVi : item.nameEn}
                            </h4>
                            <p className="mt-1 text-[12px] leading-5 text-text-light">
                              {lang === 'VN' ? item.descriptionVi : item.descriptionEn}
                            </p>
                          </div>
                          <p className="flex-shrink-0 text-sm font-bold text-primary">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between sm:mt-auto sm:pt-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-lighter">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {item.available}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={quantity === 0}
                              aria-label={`Remove ${lang === 'VN' ? item.nameVi : item.nameEn}`}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-text">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark"
                              aria-label={`Add ${lang === 'VN' ? item.nameVi : item.nameEn}`}
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <aside
              id="order-form"
              className="glass-card scroll-mt-28 rounded-2xl p-5 lg:sticky lg:top-28"
            >
              <h3 className="text-xl font-bold text-text tracking-tight">{copy.order}</h3>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="space-y-3">
                  {selectedItems.length > 0 ? (
                    selectedItems.map(({ item, quantity }) => (
                      <div key={item.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text">
                            {quantity}x {lang === 'VN' ? item.nameVi : item.nameEn}
                          </p>
                          <p className="text-xs text-text-light">{formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-semibold text-text">
                          {formatCurrency(item.price * quantity)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-background-warm px-4 py-5 text-center text-sm text-text-light">
                      {copy.empty}
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t border-border-light pt-4 text-sm">
                  <div className="flex justify-between text-text-light">
                    <span>{copy.subtotal}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-light">
                    <span>{copy.serviceFee}</span>
                    <span>{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-text">
                    <span>{copy.total}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border-light pt-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-text-muted">{copy.room}</span>
                    <input
                      value={roomNumber}
                      onChange={(event) => setRoomNumber(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/15"
                      placeholder={lang === 'VN' ? 'VD: 1208' : 'Ex: 1208'}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-text-muted">{copy.name}</span>
                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/15"
                      placeholder={lang === 'VN' ? 'Tên của quý khách' : 'Your name'}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-text-muted">{copy.phone}</span>
                    <div className="relative mt-1">
                      <PhoneIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-lighter" />
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/15"
                        placeholder="090..."
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-text-muted">{copy.note}</span>
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      className="mt-1 min-h-24 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/15"
                      placeholder={
                        lang === 'VN'
                          ? 'Ít cay, thêm đá, thời gian nhận món...'
                          : 'Less spicy, extra ice, delivery time...'
                      }
                    />
                  </label>
                </div>

                {submittedRef ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      submittedRef.startsWith('IRD-')
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {submittedRef.startsWith('IRD-') ? (
                      <span className="flex items-start gap-2">
                        <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        {lang === 'VN'
                          ? `Đã ghi nhận order ${submittedRef}. Nhân viên sẽ liên hệ xác nhận.`
                          : `Order ${submittedRef} recorded. Our team will confirm shortly.`}
                      </span>
                    ) : (
                      submittedRef
                    )}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-soft hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={itemCount === 0}
                >
                  <CheckIcon className="w-4 h-4" />
                  {copy.submit}
                </button>
              </form>
            </aside>
          </div>
        </div>
      </main>

      {itemCount > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-elevated backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text">
                {itemCount} {lang === 'VN' ? 'món đã chọn' : 'items selected'}
              </p>
              <p className="text-xs font-semibold text-primary">{formatCurrency(total)}</p>
            </div>
            <a
              href="#order-form"
              className="flex-shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
            >
              {lang === 'VN' ? 'Xem order' : 'View order'}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}
