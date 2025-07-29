const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3003' 
  : 'https://your-backend-url.vercel.app';

export interface SessionState {
  sessionId: string;
  adminUserId: string | null;
  editors: string[];
  users: User[];
  createdAt?: string;
}

export interface User {
  userId: string;
  nickname: string;
  isAdmin: boolean;
  canEdit: boolean;
  isOnline: boolean;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createSession(): Promise<{ session: SessionState; currentUserId: string }> {
    return this.request('/api/sessions', { method: 'POST' });
  }

  async getSession(sessionId: string): Promise<SessionState> {
    return this.request(`/api/sessions/${sessionId}`);
  }

  async joinSession(sessionId: string): Promise<{ session: SessionState; currentUserId: string }> {
    return this.request(`/api/sessions/${sessionId}/join`, { method: 'POST' });
  }

  async updateUser(sessionId: string, userId: string, data: { nickname?: string; isOnline?: boolean }): Promise<SessionState> {
    return this.request(`/api/sessions/${sessionId}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePermissions(
    sessionId: string, 
    action: 'grant_edit' | 'revoke_edit' | 'transfer_admin',
    userId: string,
    adminUserId: string
  ): Promise<SessionState> {
    return this.request(`/api/sessions/${sessionId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ action, userId, adminUserId }),
    });
  }

  async removeUser(sessionId: string, userId: string): Promise<SessionState> {
    return this.request(`/api/sessions/${sessionId}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getSessions(): Promise<Array<{ sessionId: string; userCount: number; adminUserId: string; createdAt: string }>> {
    return this.request('/api/sessions');
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/api/health');
  }
}

export const apiService = new ApiService(); 