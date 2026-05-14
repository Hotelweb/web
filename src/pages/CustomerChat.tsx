import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { getBySlug } from '../api/locations';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { ConnectionStatus } from '../components/admin/ConnectionStatus';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { Location } from '../types';

export function CustomerChat() {
    const { slug } = useParams<{ slug: string }>();
    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchLocation() {
            if (!slug) {
                setError(true);
                setLoading(false);
                return;
            }

            try {
                const data = await getBySlug(slug);
                setLocation(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchLocation();
    }, [slug]);

    const { isConnected, messages, isTyping, sendMessage, startTyping, stopTyping } =
        useSocket(location?.id ?? null);

    const handleSend = useCallback(
        (content: string) => {
            sendMessage(content, 'customer');
        },
        [sendMessage],
    );

    const handleTypingStart = useCallback(() => {
        startTyping('customer');
    }, [startTyping]);

    const handleTypingStop = useCallback(() => {
        stopTyping('customer');
    }, [stopTyping]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !location) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-800 mb-2">
                        Location not found
                    </h1>
                    <p className="text-sm text-gray-500">
                        The QR code you scanned may be invalid or the location no longer exists.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-semibold text-sm">
                            {location.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-semibold text-gray-900 truncate">
                            {location.name}
                        </h1>
                    </div>
                </div>
                <ConnectionStatus isConnected={isConnected} />
            </header>

            {/* Message List */}
            <MessageList messages={messages} />

            {/* Typing Indicator */}
            <div className="px-4 shrink-0">
                <TypingIndicator isVisible={isTyping} />
            </div>

            {/* Chat Input */}
            <div className="shrink-0">
                <ChatInput
                    onSend={handleSend}
                    onTypingStart={handleTypingStart}
                    onTypingStop={handleTypingStop}
                    disabled={!isConnected}
                />
            </div>
        </div>
    );
}
