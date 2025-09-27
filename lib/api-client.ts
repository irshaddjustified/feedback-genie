// API client for Firebase-based hierarchy: Organization → Clients → Projects → Surveys → Responses
class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Organization
  organization = {
    getAll: () => this.request<any[]>('/organizations'),
    getById: (id: string) => this.request<any>(`/organizations/${id}`),
    create: (data: any) => this.request<any>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => this.request<any>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  }

  // Clients
  clients = {
    getAll: (organizationId?: string) => {
      const query = organizationId ? `?organizationId=${organizationId}` : ''
      return this.request<any[]>(`/clients${query}`)
    },
    getById: (id: string) => this.request<any>(`/clients/${id}`),
    create: (data: any) => this.request<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => this.request<any>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => this.request<{ success: boolean }>(`/clients/${id}`, {
      method: 'DELETE',
    }),
  }

  // Projects
  projects = {
    getAll: (clientId?: string) => {
      const query = clientId ? `?clientId=${clientId}` : ''
      return this.request<any[]>(`/projects${query}`)
    },
    getById: (id: string) => this.request<any>(`/projects/${id}`),
    create: (data: any) => this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => this.request<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
  }

  // Surveys
  surveys = {
    getAll: (projectId?: string) => {
      const query = projectId ? `?projectId=${projectId}` : ''
      return this.request<any[]>(`/surveys${query}`)
    },
    getById: (id: string) => this.request<any>(`/surveys/${id}`),
    create: (data: any) => this.request<any>('/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => this.request<any>(`/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => this.request<{ success: boolean }>(`/surveys/${id}`, {
      method: 'DELETE',
    }),
  }

  // Responses
  responses = {
    getAll: (surveyId?: string) => {
      const query = surveyId ? `?surveyId=${surveyId}` : ''
      return this.request<any[]>(`/responses${query}`)
    },
    create: (data: any) => this.request<any>('/responses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  }

  // AI
  ai = {
    analyze: (responseId: string, text: string) => this.request<any>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ responseId, text }),
    }),
  }
}

export const apiClient = new ApiClient()
export default apiClient
