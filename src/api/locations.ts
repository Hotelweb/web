import type { Location, LocationWithPreview } from '../types';
import { request } from './client';

export async function getAll(): Promise<Location[]> {
    return request<Location[]>('/api/locations');
}

export async function getById(id: string): Promise<Location> {
    return request<Location>(`/api/locations/${id}`);
}

export async function getBySlug(slug: string): Promise<Location> {
    return request<Location>(`/api/locations/slug/${slug}`);
}

export async function create(data: { name: string }): Promise<Location> {
    return request<Location>('/api/locations', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function update(id: string, data: { name?: string }): Promise<Location> {
    return request<Location>(`/api/locations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function remove(id: string): Promise<void> {
    return request<void>(`/api/locations/${id}`, {
        method: 'DELETE',
    });
}

export async function getDashboard(): Promise<LocationWithPreview[]> {
    return request<LocationWithPreview[]>('/api/locations/admin/dashboard');
}
