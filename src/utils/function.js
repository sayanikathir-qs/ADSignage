// Utility Functions

/**
 * Checks if a given date is in the past.
 * @param {string} date - The date to check (can be a Date object or a date string).
 * @returns {boolean} True if the date is before the current date/time, false otherwise.
 */
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Creates a debounced version of a function that delays execution until after
 * the specified delay has elapsed since the last invocation.
 * Useful for limiting the rate of function calls (e.g., search inputs, resize handlers).
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - The delay in milliseconds to wait before invoking the function.
 * @returns {Function} A debounced version of the original function.
 */
export const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Formats a date as relative time (e.g., "3 hours ago", "2 days ago").
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted relative time string.
 */
export const formatRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  // Handle future dates
  if (diffInSeconds < 0) {
    return "just now";
  }

  // Define time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  // Find the appropriate interval
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);

    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return "just now";
};

/**
 * Returns initials from a name string.
 * For single-word names, returns first 2 chars. For multi-word, returns first and last initials.
 * @param {string} name - The name to extract initials from.
 * @returns {string} Uppercase initials (e.g., "John Doe" -> "JD", "Acme" -> "AC").
 */
export const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Returns a consistent color string for an avatar based on a name hash.
 * @param {string} name - The name to derive a color from.
 * @param {string} [fallback="primary"] - Fallback color when name is empty.
 * @returns {string} A Vuetify color string.
 */
export const getAvatarColor = (name, fallback = "primary") => {
  if (!name) return fallback;
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
    "purple",
    "indigo",
    "teal",
    "orange",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Formats a date string into a short localized date (e.g., "Jan 15, 2024").
 * @param {string|Date} dateStr - The date to format.
 * @returns {string} Formatted date string or "—" if input is falsy.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a numeric value as a GBP currency string with thousands separators and 2 decimal places.
 * @param {number|string|null} value - The value to format.
 * @returns {string} Formatted string (e.g., 1234.5 -> "1,234.50") or empty string if invalid.
 */


/**
 * Parses a GBP display string (with commas) into a numeric value.
 * @param {string} raw - The display string to parse (e.g., "1,234.50").
 * @returns {number|null} Parsed number rounded to 2 decimal places, or null if invalid.
 */
export const parseCreditLimit = (raw) => {
  const stripped = raw.replace(/,/g, "");
  const num = parseFloat(stripped);
  return isNaN(num) ? null : Math.round(num * 100) / 100;
};


export const formatNumber = (num) => {
  if (num === null || num === undefined) return "—";
  return Number(num).toFixed(2);
};



export const formatTime = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
};

