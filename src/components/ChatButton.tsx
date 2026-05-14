import { ChatIcon } from "./icons/ServiceIcons";

interface ChatButtonProps {
  onClick?: () => void;
}

export function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed z-50 bg-white rounded-full p-3 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{
        right: "16px",
        bottom: "35%",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
      }}
      aria-label="Open chat support"
    >
      <ChatIcon />
    </button>
  );
}
