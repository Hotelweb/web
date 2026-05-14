import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { getDashboard } from '../api/locations';
import { markAsRead } from '../api/messages';
import { LocationSidebar } from '../components/admin/LocationSidebar';
import { ConnectionStatus } from '../components/admin/ConnectionStatus';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { LocationWithPreview } from '../types';

export function AdminDashboard() {
    const { admin, isAuthenticated, logout } = useAuth();
    const [locations, setLocations] = useState<LocationWithPreview[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const { isConnected, messages, isTyping, sendMessage, startTyping, stopTyping } =
        useSocket(selectedLocationId);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // Fetch locations with unread counts on mount
    useEffect(() => {
        async function fetchLocations() {
            try {
                const data = await getDashboard();
                setLocations(data);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLocations();
    }, []);

    const handleSelectLocation = useCallback(
        async (locationId: string) => {
            setSelectedLocationId(locationId);

            // Mark messages as read when selecting a location
            try {
                await markAsRead(locationId);
                // Update local unread count
                setLocations((prev) =>
                    prev.map((loc) =>
                        loc.id === locationId ? { ...loc, unreadCount: 0 } : loc,
                    ),
                );
            } catch (error) {
                console.error('Failed to mark messages as read:', error);
            }
        },
        [],
    );

    const handleSend = useCallback(
        (content: string) => {
            sendMessage(content, 'admin');
        },
        [sendMessage],
    );

    const handleTypingStart = useCallback(() => {
        startTyping('admin');
    }, [startTyping]);

    const handleTypingStop = useCallback(() => {
        stopTyping('admin');
    }, [stopTyping]);

    const selectedLocationData = locations.find((l) => l.id === selectedLocationId);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Location Sidebar */}
            <LocationSidebar
                locations={locations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {selectedLocationData ? (
                            <div className="min-w-0">
                                <h1 className="font-semibold text-gray-900 truncate">
                                    {selectedLocationData.name}
                                </h1>
                                <p className="text-xs text-gray-500">Customer Support Chat</p>
                            </div>
                        ) : (
                            <div className="min-w-0">
                                <h1 className="font-semibold text-gray-900">Dashboard</h1>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        {selectedLocationId && (
                            <ConnectionStatus isConnected={isConnected} />
                        )}
                        <span className="text-sm text-gray-600">{admin?.email}</span>
                        <button
                            type="button"
                            onClick={logout}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Chat Content */}
                {selectedLocationId ? (
                    <>
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
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-400 text-lg">Select a conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
