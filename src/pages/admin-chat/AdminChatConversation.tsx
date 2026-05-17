import type { RefObject } from 'react'
import type { ChatSession } from '../../api'
import { CannedResponses } from '../../components/chat/CannedResponses'
import { ConnectionBanner, ConnectionDot } from '../../components/chat/ConnectionBanner'
import { GuestInfoPanel } from '../../components/chat/GuestInfoPanel'
import { MessageBubble, type DisplayMessage } from '../../components/chat/MessageBubble'
import { SkeletonList } from '../../components/chat/SkeletonMessage'
import { TypingIndicator } from '../../components/chat/TypingIndicator'
import type { ConnectionState } from '../../hooks/useChatSocket'
import {
  ImageIcon,
  MoreIcon,
  PaperclipIcon,
  PhoneIcon,
  SendIcon,
  SmileIcon,
  TranslateBubbleIcon,
  VideoIcon,
} from '../../components/icons/ServiceIcons'
import { getLanguage } from '../../lib/languages'
import { Avatar } from './Avatar'
import { DateDivider } from './DateDivider'

type AdminChatConversationProps = {
  session: ChatSession
  connection: ConnectionState
  showOriginal: boolean
  onShowOriginalToggle: () => void
  loadingMessages: boolean
  messages: DisplayMessage[]
  guestTyping: boolean
  messagesEndRef: RefObject<HTMLDivElement | null>
  input: string
  onInputChange: (value: string) => void
  inputRef: RefObject<HTMLTextAreaElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onAttachClick: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRetry: (msg: DisplayMessage) => void
}

export function AdminChatConversation({
  session,
  connection,
  showOriginal,
  onShowOriginalToggle,
  loadingMessages,
  messages,
  guestTyping,
  messagesEndRef,
  input,
  onInputChange,
  inputRef,
  fileInputRef,
  onSend,
  onKeyDown,
  onAttachClick,
  onFileChange,
  onRetry,
}: AdminChatConversationProps) {
  const guestName = session.customer_name || `Khách #${session.id}`
  const customerLang = getLanguage(session.customer_language)

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-5 py-3 border-b border-border-light flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={session.customer_name || `Khách ${session.id}`} />
            <div className="min-w-0">
              <p className="font-semibold text-text text-[15px] truncate">{guestName}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <ConnectionDot state={connection} />
                <span className="text-[11.5px] text-text-light">
                  {connection === 'online'
                    ? 'Trực tuyến'
                    : connection === 'reconnecting'
                      ? 'Đang kết nối lại…'
                      : 'Mất kết nối'}
                </span>
                <span className="text-text-lighter text-xs">·</span>
                <span className="text-[11.5px] text-text-light flex items-center gap-1">
                  <span aria-hidden>{customerLang.flag}</span>
                  {customerLang.nativeName}
                </span>
                {session.room_number ? (
                  <>
                    <span className="text-text-lighter text-xs">·</span>
                    <span className="text-[11.5px] text-text-light">Phòng {session.room_number}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-text-muted">
            <button
              type="button"
              onClick={onShowOriginalToggle}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12px] font-medium transition-colors duration-200 cursor-pointer ${
                showOriginal
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-gray-50 text-text-muted hover:bg-gray-100'
              }`}
              aria-pressed={showOriginal}
            >
              <TranslateBubbleIcon className="w-4 h-4" />
              {showOriginal ? 'Ẩn bản gốc' : 'Xem bản gốc'}
            </button>
            <button
              className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              aria-label="Gọi điện"
            >
              <PhoneIcon className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              aria-label="Gọi video"
            >
              <VideoIcon className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              aria-label="Tùy chọn"
            >
              <MoreIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        <ConnectionBanner
          state={connection}
          labels={{
            offline: 'Mất kết nối — tin nhắn sẽ gửi khi kết nối lại',
            reconnecting: 'Đang kết nối lại…',
          }}
        />

        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-3 bg-gradient-to-b from-white to-gray-50/40">
          {loadingMessages ? <SkeletonList /> : null}

          <DateDivider label="Hôm nay" />

          {messages.map((msg) => (
            <MessageBubble
              key={`${msg.id}_${msg.client_message_id ?? ''}`}
              message={msg}
              viewer="staff"
              showOriginal={showOriginal}
              labels={{
                sending: 'Đang gửi',
                sent: 'Đã gửi',
                delivered: 'Đã chuyển',
                read: 'Đã xem',
                failed: 'Lỗi',
                retry: 'Gửi lại',
                showOriginal: 'Xem bản gốc',
                hideOriginal: 'Ẩn bản gốc',
                translating: 'Đang dịch…',
                translationFailed: 'Không dịch được',
                translatedBadge: 'Đã dịch',
                you: 'Bạn',
                staff: 'Nhân viên',
              }}
              onRetry={onRetry}
            />
          ))}

          {guestTyping ? (
            <TypingIndicator
              label={`${session.customer_name || 'Khách'} đang nhập`}
              variant="admin"
            />
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-5 py-3 border-t border-border-light bg-white flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={onFileChange}
          />
          <div className="flex items-end gap-1.5">
            <CannedResponses onSelect={onInputChange} />
            <button
              type="button"
              onClick={onAttachClick}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-text-muted cursor-pointer flex-shrink-0 transition-colors duration-200"
              aria-label="Đính kèm tệp"
            >
              <PaperclipIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onAttachClick}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-text-muted cursor-pointer flex-shrink-0 transition-colors duration-200"
              aria-label="Đính kèm ảnh"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={`Nhập tin nhắn (sẽ tự dịch sang ${customerLang.nativeName})…`}
                className="w-full max-h-[140px] resize-none px-4 py-2.5 rounded-2xl bg-gray-50 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white border border-border-light focus:border-indigo-300 transition-all placeholder:text-text-lighter pr-9"
                style={{ minHeight: '40px' }}
              />
              <button
                className="absolute right-2 bottom-1.5 w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center text-text-muted cursor-pointer"
                aria-label="Thêm emoji"
              >
                <SmileIcon className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={onSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl gradient-indigo text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:shadow-card-hover transition-all duration-200 flex-shrink-0 active:scale-95"
              aria-label="Gửi tin nhắn"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10.5px] text-text-lighter mt-2 px-1 flex items-center gap-1.5">
            <TranslateBubbleIcon className="w-3 h-3" />
            <span>
              Tin nhắn của bạn sẽ tự động dịch sang{' '}
              <strong className="text-text-muted">{customerLang.nativeName}</strong> cho khách
            </span>
          </p>
        </div>
      </div>

      <GuestInfoPanel session={session} />
    </>
  )
}
