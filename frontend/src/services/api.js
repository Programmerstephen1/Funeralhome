/**
 * API Service Layer
 */

import { getApiBaseUrl } from "./config";

const API_BASE_URL = getApiBaseUrl();

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
      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => "");

      if (!response.ok) {
        if (response.status === 401) this.logout();
        const message = payload && typeof payload === "object" ? payload.message || payload.error : payload;
        throw new Error(message || `API error: ${response.status}`);
      }

      if (!isJson) {
        return payload;
      }

      return payload ?? {};
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

  // --- PRO-GRADE GOOGLE SSO HANDLER ---
  async googleLogin(googleToken) {
    const data = await this.request("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ token: googleToken }),
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