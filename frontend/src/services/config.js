export const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (typeof window === "undefined") {
    return configured ? configured.replace(/\/$/, "") : "http://localhost:5000";
  }

  const hostname = window.location.hostname;
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

  if (configured) {
    const normalized = configured.replace(/\/$/, "");
    if (isLocalHost || normalized.includes("localhost") || normalized.includes("127.0.0.1")) {
      return "http://localhost:5000";
    }
    return normalized;
  }

  if (isLocalHost) {
    return "http://localhost:5000";
  }

  return window.location.origin;
};

export const buildApiUrl = (endpoint) => {
  const base = getApiBaseUrl();
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${normalized}`;
};
