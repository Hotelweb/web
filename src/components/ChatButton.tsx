import { ChatIcon } from "./icons/ServiceIcons";

interface ChatButtonProps {
  onClick?: () => void;
}

export function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed z-50 rounded-full p-3.5 cursor-pointer transition-all duration-300 hover:shadow-premium-lg hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 animate-float gradient-primary text-white"
      style={{
        right: "16px",
        bottom: "35%",
        boxShadow: "0 6px 24px rgba(30, 58, 138, 0.25)",
      }}
      aria-label="Open chat support"
    >
      <ChatIcon />
    </button>
  );
}
