// Format date
export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return parts[0][0];
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex =
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

// Get completion color
export const getCompletionColor = (percentage) => {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 50) return "text-yellow-600";
  return "text-red-600";
};

// Get completion badge color
export const getCompletionBadgeColor = (percentage) => {
  if (percentage >= 80) return "bg-green-100 text-green-800";
  if (percentage >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

// Get status badge color
export const getStatusBadgeColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    verified: "bg-green-100 text-green-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    placed: "bg-green-100 text-green-800",
    unplaced: "bg-yellow-100 text-yellow-800",
  };
  //return colors[status] || "bg-gray-100 text-gray-800";
  return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

// Truncate text
export const truncate = (text, length = 100) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

// Calculate CGPA color
export const getCGPAColor = (cgpa) => {
  if (cgpa >= 8.5) return "text-green-600";
  if (cgpa >= 7.0) return "text-yellow-600";
  return "text-red-600";
};

// Get application status badge color
export const getApplicationStatusColor = (status) => {
  const colors = {
    applied: "bg-blue-100 text-blue-800",
    shortlisted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    selected: "bg-purple-100 text-purple-800",
    "on-hold": "bg-yellow-100 text-yellow-800",
  };
  //return colors[status] || "bg-gray-100 text-gray-800";
  return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

// Get application status label
export const getApplicationStatusLabel = (status) => {
  const labels = {
    applied: "Applied",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
    selected: "Selected",
    "on-hold": "On Hold",
  };
  //return labels[status] || status;
  return labels[status?.toLowerCase()] || status;
};

// Check if application is eligible for withdrawal
export const canWithdrawApplication = (status) => {
  //return ["applied", "on-hold"].includes(status);
  return ["applied", "on-hold"].includes(status?.toLowerCase());
};


// New shared helper — used wherever we display an ENUM_LIKE_THIS value. This was added when the backend was built on spring boot.
export const formatEnum = (val) =>
  val ? val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";
