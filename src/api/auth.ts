import type { Admin } from '../types';
import { request } from './client';

export interface LoginResponse {
    accessToken: string;
    admin: Admin;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}
