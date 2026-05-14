import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom hook for managing Socket.IO WebSocket connections to the /chat namespace.
 *
 * Handles:
 * - Connecting to the /chat namespace when a locationId is provided
 * - Joining the appropriate room and receiving message history
 * - Listening for new messages and typing indicators
 * - Sending messages and typing events
 * - Automatic reconnection with exponential backoff
 * - Cleanup on unmount
 *
 * @param locationId - The location ID to join, or null to skip connection
 * @returns Socket state and action functions
 */
export function useSocket(locationId: string | null) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!locationId) return;

        const socket = io(`${SOCKET_URL}/chat`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
            randomizationFactor: 0.5,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join_room', { locationId });
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('message_history', (data: { messages: Message[] }) => {
            setMessages(data.messages);
        });

        socket.on('receive_message', (data: { message: Message }) => {
            setMessages((prev) => [...prev, data.message]);
        });

        socket.on('user_typing', (data: { senderType: string; isTyping: boolean }) => {
            setIsTyping(data.isTyping);
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setMessages([]);
            setIsTyping(false);
        };
    }, [locationId]);

    const sendMessage = useCallback(
        (content: string, senderType: 'customer' | 'admin') => {
            if (socketRef.current && locationId) {
                socketRef.current.emit('send_message', {
                    locationId,
                    content,
                    senderType,
                });
            }
        },
        [locationId],
    );

    const startTyping = useCallback(
        (senderType: 'customer' | 'admin') => {
            if (socketRef.current && locationId) {
                socketRef.current.emit('typing_start', { locationId, senderType });
            }
        },
        [locationId],
    );

    const stopTyping = useCallback(
        (senderType: 'customer' | 'admin') => {
            if (socketRef.current && locationId) {
                socketRef.current.emit('typing_stop', { locationId, senderType });
            }
        },
        [locationId],
    );

    return {
        messages,
        isConnected,
        isTyping,
        sendMessage,
        startTyping,
        stopTyping,
    };
}
