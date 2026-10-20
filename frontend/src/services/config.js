export const getSiteUrl = () => {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) {
    const siteUrl = new URL(configured);
    if (!['https:', 'http:'].includes(siteUrl.protocol) || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
      throw new Error('VITE_SITE_URL must be an absolute origin without a path, query, or fragment.');
    }
    return siteUrl.origin;
  }
  return typeof window === 'undefined' ? '' : window.location.origin;
};

export const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (typeof window === "undefined") {
    return configured ? configured.replace(/\/$/, "") : "http://localhost:5000";
  }

  const hostname = window.location.hostname;
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

  if (configured) {
    const normalized = configured.replace(/\/$/, "");
    const pointsAtLocalApi = /:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(normalized);
    if (pointsAtLocalApi && !isLocalHost) {
      const apiUrl = new URL(normalized);
      apiUrl.hostname = window.location.hostname;
      return apiUrl.toString().replace(/\/$/, "");
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
