import { createContext, useContext, type ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import type { Message } from '../types';

interface SocketContextValue {
    messages: Message[];
    isConnected: boolean;
    isTyping: boolean;
    sendMessage: (content: string, senderType: 'customer' | 'admin') => void;
    startTyping: (senderType: 'customer' | 'admin') => void;
    stopTyping: (senderType: 'customer' | 'admin') => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
    locationId: string | null;
    children: ReactNode;
}

export function SocketProvider({ locationId, children }: SocketProviderProps) {
    const socketState = useSocket(locationId);

    return <SocketContext.Provider value={socketState}>{children}</SocketContext.Provider>;
}

export function useSocketContext(): SocketContextValue {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
}
