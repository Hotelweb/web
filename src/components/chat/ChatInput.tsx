import { useState, useRef, useCallback, type FormEvent, type ChangeEvent, type KeyboardEvent } from "react";

interface ChatInputProps {
    onSend: (content: string) => void;
    onTypingStart: () => void;
    onTypingStop: () => void;
    disabled?: boolean;
}

/**
 * Chat input component with text field and send button.
 *
 * Handles typing indicator events with a 300ms debounce:
 * - Calls onTypingStart when the user begins typing
 * - Calls onTypingStop after 300ms of inactivity
 *
 * Submits on Enter key press or send button click.
 * Disables input when the `disabled` prop is true (e.g., not connected).
 */
export function ChatInput({ onSend, onTypingStart, onTypingStop, disabled = false }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);

    const clearTypingTimeout = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, []);

    const stopTyping = useCallback(() => {
        clearTypingTimeout();
        if (isTypingRef.current) {
            isTypingRef.current = false;
            onTypingStop();
        }
    }, [clearTypingTimeout, onTypingStop]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessage(value);

        if (disabled) return;

        // Start typing indicator if not already typing
        if (!isTypingRef.current && value.length > 0) {
            isTypingRef.current = true;
            onTypingStart();
        }

        // Reset the debounce timer
        clearTypingTimeout();

        // If input is cleared, stop typing immediately
        if (value.length === 0) {
            stopTyping();
            return;
        }

        // Set debounce: call onTypingStop after 300ms of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 300);
    };

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();

        const trimmed = message.trim();
        if (!trimmed || disabled) return;

        onSend(trimmed);
        setMessage("");
        stopTyping();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-2"
        >
            <input
                type="text"
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={disabled}
                aria-label="Message input"
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                    min-h-[44px]"
            />
            <button
                type="submit"
                disabled={disabled || message.trim().length === 0}
                aria-label="Send message"
                className="flex items-center justify-center w-11 h-11 rounded-full
                    bg-blue-600 text-white hover:bg-blue-700
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    transition-colors shrink-0"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true"
                >
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
            </button>
        </form>
    );
}
