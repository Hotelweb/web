import type { Message } from "../../types";

interface MessageBubbleProps {
    message: Message;
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isAdmin = message.senderType === "admin";

    return (
        <div
            className={`flex ${isAdmin ? "justify-end" : "justify-start"} mb-3`}
        >
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${isAdmin
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                </p>
                <time
                    dateTime={message.createdAt}
                    className={`block text-xs mt-1 ${isAdmin ? "text-blue-100" : "text-gray-500"
                        }`}
                >
                    {formatTime(message.createdAt)}
                </time>
            </div>
        </div>
    );
}
