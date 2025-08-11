// API utility for PHP backend communication
const API_BASE_URL = '/api'; // Update this to your actual API URL when deployed

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Authentication methods
  async signIn(email: string, password: string) {
    return this.request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signUp(email: string, password: string, fullName: string) {
    return this.request('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  async signOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    return Promise.resolve();
  }

  // Forms methods
  async getForms() {
    return this.request('/forms/list.php');
  }

  async getForm(id: string) {
    return this.request(`/forms/get.php?id=${id}`);
  }

  async createForm(formData: any) {
    return this.request('/forms/create.php', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async updateForm(id: string, formData: any) {
    return this.request('/forms/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...formData }),
    });
  }

  async deleteForm(id: string) {
    return this.request('/forms/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Submissions methods
  async getSubmissions(formId?: string) {
    const endpoint = formId ? `/submissions/list.php?form_id=${formId}` : '/submissions/list.php';
    return this.request(endpoint);
  }

  async submitForm(formId: string, data: any) {
    return this.request('/forms/submit.php', {
      method: 'POST',
      body: JSON.stringify({ form_id: formId, data }),
    });
  }

  // Themes methods
  async getThemes() {
    return this.request('/themes/list.php');
  }

  async createTheme(themeData: any) {
    return this.request('/themes/create.php', {
      method: 'POST',
      body: JSON.stringify(themeData),
    });
  }

  // Users methods (admin only)
  async getUsers() {
    return this.request('/admin/users.php');
  }
}

export const apiClient = new ApiClient();