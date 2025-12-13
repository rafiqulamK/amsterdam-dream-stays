// API client utility for PHP backend
const API_BASE = '/api';

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, fullName: string) {
    return this.request('/auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  }

  async logout() {
    return this.request('/auth.php?action=logout', {
      method: 'POST',
    });
  }

  async getUser() {
    return this.request('/auth.php?action=user');
  }

  // Properties endpoints
  async getProperties(params: { status?: string; limit?: number; offset?: number } = {}) {
    const searchParams = new URLSearchParams();
    searchParams.append('action', 'list');
    if (params.status) searchParams.append('status', params.status);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    return this.request(`/properties.php?${searchParams}`);
  }

  async getProperty(id: string) {
    return this.request(`/properties.php?action=single&id=${id}`);
  }

  async createProperty(propertyData: any) {
    return this.request('/properties.php?action=create', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updateProperty(id: string, propertyData: any) {
    return this.request('/properties.php?action=update', {
      method: 'PUT',
      body: JSON.stringify({ id, ...propertyData }),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/properties.php?action=delete&id=${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings endpoints
  async getBookings() {
    return this.request('/bookings.php?action=list');
  }

  async createBooking(bookingData: any) {
    return this.request('/bookings.php?action=create', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Leads endpoints
  async createLead(leadData: any) {
    return this.request('/leads.php?action=create', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async getLeads() {
    return this.request('/leads.php?action=list');
  }

  // Settings endpoints
  async getSettings(key: string) {
    return this.request(`/settings.php?action=get&key=${key}`);
  }

  async updateSettings(key: string, value: any) {
    return this.request('/settings.php?action=update', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }
}

export const apiClient = new ApiClient();