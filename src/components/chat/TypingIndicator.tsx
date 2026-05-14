interface TypingIndicatorProps {
    isVisible: boolean;
}

/**
 * Typing indicator component that displays three bouncing dots
 * to show that someone is currently typing a message.
 *
 * Renders nothing when `isVisible` is false.
 */
export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="flex justify-start mb-3" aria-live="polite" aria-label="Someone is typing">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms", animationDuration: "600ms" }}
                />
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms", animationDuration: "600ms" }}
                />
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms", animationDuration: "600ms" }}
                />
            </div>
        </div>
    );
}
