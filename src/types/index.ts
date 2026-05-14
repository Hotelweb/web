// Entity interfaces matching backend Prisma schema

export interface Location {
    id: string;
    name: string;
    slug: string;
    qrCodeUrl: string | null;
    createdAt: string;
}

export interface Message {
    id: string;
    locationId: string;
    senderType: 'customer' | 'admin';
    content: string;
    isRead: boolean;
    createdAt: string;
    /** Client-side flag indicating the message failed to send */
    failed?: boolean;
}

export interface Admin {
    id: string;
    email: string;
    createdAt: string;
}

export interface LocationWithPreview extends Location {
    latestMessage: Message | null;
    unreadCount: number;
}

// JWT payload interface
export interface JwtPayload {
    sub: string;
    email: string;
    iat: number;
    exp: number;
}

// Socket event payloads

export interface JoinRoomPayload {
    locationId: string;
}

export interface SendMessagePayload {
    locationId: string;
    content: string;
    senderType: 'customer' | 'admin';
}

export interface TypingPayload {
    locationId: string;
    senderType: 'customer' | 'admin';
}

export interface ReceiveMessagePayload {
    message: Message;
}
