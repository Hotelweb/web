import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
    messages: Message[];
    onRetry?: (message: Message) => void;
}

/**
 * Renders a scrollable list of chat messages in chronological order (oldest first).
 *
 * The API returns messages in descending order, so this component reverses them
 * for display. Auto-scrolls to the bottom when new messages arrive.
 *
 * Supports marking failed messages with a retry option via the onRetry callback.
 */
export function MessageList({ messages, onRetry }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Sort messages chronologically (oldest first at top)
    const chronologicalMessages = [...messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    if (chronologicalMessages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">
                    No messages yet. Start the conversation!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4" role="log" aria-label="Chat messages">
            {chronologicalMessages.map((message) => (
                <div key={message.id}>
                    <MessageBubble message={message} />
                    {message.failed && onRetry && (
                        <div className="flex justify-end mb-2">
                            <button
                                type="button"
                                onClick={() => onRetry(message)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                aria-label={`Retry sending message: ${message.content}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Failed to send. Tap to retry
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
