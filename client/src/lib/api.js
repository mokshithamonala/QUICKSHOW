const resolveApiBase = () => {
  const configured = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  if (!configured) return "";

  // If VITE_API_URL points to localhost while running on a remote preview host, use same-origin relative /api
  if (
    typeof window !== "undefined" &&
    configured.includes("localhost") &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "";
  }
  return configured;
};

export const API_BASE = resolveApiBase();

export const getCurrencySymbol = () => {
  const raw = (import.meta.env.VITE_CURRENCY || "₹").replace(/['"]/g, "").trim();
  if (!raw || raw.toUpperCase() === "INR") return "₹";
  if (raw.toUpperCase() === "USD") return "$";
  return raw;
};

export const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return `${getCurrencySymbol()}${num.toLocaleString("en-IN")}`;
};

export const apiRequest = async (path, { method = "GET", body, getToken } = {}) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (typeof getToken === "function") {
    try {
      const token = await getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Guest request
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: "Unexpected server response" };
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};
