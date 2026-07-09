/**
 * API Service Layer
 */

// 🟢 PRO-GRADE FIX: Dynamically falls back to localhost if not on Render
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem("token");
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = { ...options, headers };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        if (response.status === 401) this.logout();
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async login(email, password) {
    const data = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  }

  async register(email, password) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // 🟢 NEW: Added OTP handler so RegisterPage doesn't have to use raw fetch()
  async sendOtp(email) {
    return this.request("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  logout() {
    localStorage.removeItem("token");
    window.location.hash = "#login"; 
  }

  async healthCheck() { return this.request("/api/health"); }
  async getServices() { return this.request("/api/services"); }
  async getTributes() { return this.request("/api/tributes"); }
  
  async createTribute(name, message) {
    return this.request("/api/tributes", {
      method: "POST",
      body: JSON.stringify({ name, message }),
    });
  }
  
  async initiateStkPush(amount, phone, email) {
    return this.request("/api/payments/stkpush", {
      method: "POST",
      body: JSON.stringify({ amount, phone, email }),
    });
  }
}

export default new ApiService();