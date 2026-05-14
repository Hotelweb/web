import type { Message } from '../types';
import { request } from './client';

export async function getByLocation(
    locationId: string,
    cursor?: string,
): Promise<Message[]> {
    const params = new URLSearchParams();
    if (cursor) {
        params.set('cursor', cursor);
    }
    const query = params.toString();
    const endpoint = `/api/messages/location/${locationId}${query ? `?${query}` : ''}`;
    return request<Message[]>(endpoint);
}

export async function markAsRead(locationId: string): Promise<void> {
    return request<void>(`/api/messages/${locationId}/read`, {
        method: 'POST',
    });
}
