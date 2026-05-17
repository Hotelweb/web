import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { clearAuth } from '../lib/auth'
import { UserCircleIcon } from './icons/ServiceIcons'

interface UserMenuProps {
  /** Optional secondary line under the user name (e.g. role label). */
  subtitle?: string
  /** Visual size: `sm` for tight headers, `md` for full pages. */
  size?: 'sm' | 'md'
}

/**
 * Compact user pill with a dropdown menu containing the logout action.
 * Used in admin pages so any logged-in user can sign out.
 */
export function UserMenu({ subtitle, size = 'md' }: UserMenuProps) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click and on Escape
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!auth) return null

  const handleLogout = () => {
    setOpen(false)
    clearAuth()
    navigate('/login', { replace: true })
  }

  const isSmall = size === 'sm'

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xl bg-white border border-border-light hover:bg-gray-50 cursor-pointer transition-colors ${
          isSmall ? 'px-2 py-1.5' : 'px-3 py-2'
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className={`rounded-full bg-emerald-50 text-primary flex items-center justify-center flex-shrink-0 ${
            isSmall ? 'w-6 h-6' : 'w-7 h-7'
          }`}
        >
          <UserCircleIcon className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </span>
        <span className="hidden sm:flex flex-col text-left min-w-0">
          <span
            className={`font-medium text-text truncate max-w-[140px] ${
              isSmall ? 'text-[12px]' : 'text-[12.5px]'
            }`}
          >
            {auth.user.full_name}
          </span>
          {subtitle ? (
            <span className="text-[10.5px] text-text-light truncate max-w-[140px]">{subtitle}</span>
          ) : null}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`text-text-lighter ${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-border-light overflow-hidden z-50 animate-scale-in"
        >
          <div className="px-4 py-3 border-b border-border-light">
            <p className="text-[13px] font-semibold text-text truncate">{auth.user.full_name}</p>
            <p className="text-[11.5px] text-text-light truncate">{auth.user.email}</p>
          </div>
          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors flex items-center gap-2"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  )
}
