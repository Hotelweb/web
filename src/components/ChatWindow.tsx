import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { createChatSession, getChatMessages } from "../api";
import type { ChatMessage, ChatSession } from "../api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
];

interface ChatWindowProps {
  hotelId: number;
  hotelName: string;
  onClose: () => void;
}

export function ChatWindow({ hotelId, hotelName, onClose }: ChatWindowProps) {
  const [step, setStep] = useState<"language" | "chat">("language");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket when session is created
  useEffect(() => {
    if (!session) return;

    const newSocket = io(`${API_BASE}/chat`, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      newSocket.emit("joinSession", { sessionId: session.id });
    });

    newSocket.on("newMessage", (message: ChatMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLanguageSelect = async (langCode: string) => {
    setSelectedLanguage(langCode);
    setLoading(true);

    try {
      // Check if there's an existing session in localStorage
      const storageKey = `chat_session_${hotelId}_${langCode}`;
      const existingToken = localStorage.getItem(storageKey);

      let chatSession: ChatSession;

      if (existingToken) {
        // Try to reuse existing session
        try {
          const res = await fetch(
            `${API_BASE}/chat/sessions/token/${existingToken}`,
          );
          if (res.ok) {
            chatSession = await res.json();
            if (chatSession.status !== "CLOSED") {
              setSession(chatSession);
              const msgs = await getChatMessages(chatSession.id);
              setMessages(msgs);
              setStep("chat");
              setLoading(false);
              return;
            }
          }
        } catch {
          // Session expired or invalid, create new one
        }
      }

      // Create new session
      chatSession = await createChatSession({
        hotel_id: hotelId,
        customer_language: langCode,
      });

      localStorage.setItem(storageKey, chatSession.customer_token);
      setSession(chatSession);

      // Load initial messages (welcome message)
      const msgs = await getChatMessages(chatSession.id);
      setMessages(msgs);
      setStep("chat");
    } catch (err) {
      console.error("Failed to create chat session:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session || !selectedLanguage) return;

    const messageText = inputMessage.trim();
    setInputMessage("");

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: session.id,
      sender_type: "CUSTOMER",
      message_type: "TEXT",
      source_language: selectedLanguage,
      original_message: messageText,
      translated_message: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Send via WebSocket
    if (socket?.connected) {
      socket.emit("sendMessage", {
        sessionId: session.id,
        message: messageText,
        source_language: selectedLanguage,
        sender_type: "CUSTOMER",
      });
    } else {
      // Fallback to REST API
      try {
        await fetch(
          `${API_BASE}/chat/sessions/${session.id}/messages/customer`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: messageText,
              source_language: selectedLanguage,
            }),
          },
        );
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chat Container */}
      <div className="relative w-full max-w-[400px] h-[600px] max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{hotelName}</p>
              <p className="text-xs text-white/70">
                {step === "language" ? "Select language" : "Online"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close chat"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {step === "language" ? (
          <LanguageSelector
            languages={LANGUAGES}
            onSelect={handleLanguageSelect}
            loading={loading}
          />
        ) : (
          <ChatMessages
            messages={messages}
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSend={handleSendMessage}
            onKeyPress={handleKeyPress}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>
    </div>
  );
}

// Language Selector Component
function LanguageSelector({
  languages,
  onSelect,
  loading,
}: {
  languages: Language[];
  onSelect: (code: string) => void;
  loading: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose your language
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Select a language to start chatting
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            disabled={loading}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">{lang.nativeName}</p>
              <p className="text-xs text-gray-500">{lang.name}</p>
            </div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-gray-500">
            Starting chat session...
          </span>
        </div>
      )}
    </div>
  );
}

// Chat Messages Component
function ChatMessages({
  messages,
  inputMessage,
  onInputChange,
  onSend,
  onKeyPress,
  messagesEndRef,
}: {
  messages: ChatMessage[];
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button
            onClick={onSend}
            disabled={!inputMessage.trim()}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-light transition-colors"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: ChatMessage }) {
  const isCustomer = message.sender_type === "CUSTOMER";
  const isSystem = message.message_type === "SYSTEM";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-full px-4 py-1.5 max-w-[80%]">
          <p className="text-xs text-gray-500 text-center">
            {message.original_message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isCustomer
            ? "bg-primary text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.original_message}
        </p>
        <p
          className={`text-[10px] mt-1 ${
            isCustomer ? "text-white/60" : "text-gray-400"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
