//Below code is using axios for making API calls to a backend built on Spring boot. 
//Note: feedAPI.js has been merged into this file to consolidate all API calls in one place. But for the backend built on node.js and Express.js, feedAPI.js was a separate file. The code is kept for reference in case we need to switch back to the previous backend or for understanding the structure of API calls.

import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let isRedirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status } = error.response;
    const requestUrl = error.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRequest) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        toast.error("Session expired. Please login again.");
        setTimeout(() => { window.location.href = "/login"; }, 500);
      }
    } else if (status === 403) {
      toast.error(error.response.data?.message || "Access denied");
    } else {
      toast.error(error.response.data?.message || "Something went wrong");
    }

    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  registerStudent: (data) => api.post("/auth/register/student", data),
  registerRecruiter: (data) => api.post("/auth/register/recruiter", data),
  registerAlumni: (data) => api.post("/auth/register/alumni", data),
  // Admin self-registration is disabled by design (Super Admin creates admins).
  registerAdmin: () =>
    Promise.reject({ response: { data: { message: "Admin self-registration is disabled. Contact a Super Admin." } } }),
};

// ============ STUDENT ============
export const studentAPI = {
  getProfile: () => api.get("/student/profile"),
  updateProfile: (data) => api.put("/student/profile", data),
  getProfileCompletion: () => api.get("/student/profile/completion"),
  getDashboard: () => api.get("/student/dashboard"),
  requestExtension: (reason) => api.post("/student/request-extension", { reason }),
  getPlacements: () => api.get("/student/placements"),
  getReferrals: () => api.get("/referrals"), // path differs from original /student/referrals
  trackDownload: () => Promise.resolve({ data: { success: true } }),
};

// ============ RECRUITER ============
export const recruiterAPI = {
  getProfile: () => api.get("/recruiter/profile"),
  updateProfile: (data) => api.put("/recruiter/profile", data),
    exportJobApplications: (jobId, status) =>
    api.get(`/jobs/${jobId}/export`, { params: { status }, responseType: "blob" }),
  autoShortlistByATS: (jobId, threshold) =>
    api.post(`/jobs/${jobId}/auto-shortlist`, { threshold }),
};

// ============ ADMIN ============
export const adminAPI = {
  getProfile: () => api.get("/admin/profile"),
  updateProfile: (data) => api.put("/admin/profile", data),
  getDashboardStats: () => api.get("/admin/dashboard/stats"),

  getAllRecruiters: (params) => api.get("/admin/recruiters", { params }),
  getPendingRecruiters: () => api.get("/admin/recruiters/pending"),
  verifyRecruiter: (id, data) => {
    const endpoint = data.action === "approve" ? "approve" : "reject";
    return api.post(`/admin/recruiters/${id}/${endpoint}`, { reason: data.rejectionReason });
  },

  getAllAlumni: (params) => api.get("/admin/alumni", { params }),
  getPendingAlumni: () => api.get("/admin/alumni/pending"),
  verifyAlumni: (id, data) => {
    const endpoint = data.action === "approve" ? "approve" : "reject";
    return api.post(`/admin/alumni/${id}/${endpoint}`, { reason: data.rejectionReason });
  },

  getAllStudents: (params) => api.get("/admin/students", { params }),

  getAllJobs: (params) => api.get("/admin/jobs", { params }),
  getPendingJobs: () => api.get("/admin/jobs/pending"),
  verifyJob: (id, data) => {
    const endpoint = data.action === "approve" ? "approve" : "reject";
    return api.post(`/admin/jobs/${id}/${endpoint}`, { reason: data.rejectionReason });
  },

  getAllApplications: (params) => api.get("/admin/applications", { params }),
  getExtensionRequests: (status) => api.get("/admin/extension-requests", { params: { status } }),
  getExtensionStats: () => api.get("/admin/extension-requests/stats"),
  reviewExtensionRequest: (studentId, requestId, action, extensionDays) =>
    api.post(`/admin/extension-requests/${studentId}/${requestId}/review`, { action, extensionDays }),

  getJobDetails: (jobId) => api.get(`/admin/jobs/${jobId}`),
  adminUpdateApplicationStatus: (applicationId, data) =>
    api.put(`/admin/applications/${applicationId}/status`, data),
   exportJobApplications: (jobId, status) =>
    api.get(`/admin/jobs/${jobId}/export`, { params: { status }, responseType: "blob" }),
  bulkUpdateApplications: (data) => api.patch("/admin/applications/bulk-update", data),

  createAdmin: (data) => api.post("/admin/create", data), // path differs from original /admin/admins
  getAllAdmins: () => api.get("/admin/admins"),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),

  getPendingReferrals: () => api.get("/admin/referrals/pending"),
  getAllReferrals: () => api.get("/admin/referrals"),
  verifyReferral: (id, action) => {
    const endpoint = action === "approve" ? "approve" : "reject";
    return api.post(`/admin/referrals/${id}/${endpoint}`);
  },
    extendStudent: (id, days) => api.post(`/admin/students/${id}/extend`, { days }),
};

// ============ ALUMNI ============
export const alumniAPI = {
  getProfile: () => api.get("/alumni/profile"),
  updateProfile: (data) => api.put("/alumni/profile", data),
  createReferral: (data) => api.post("/alumni/referrals", data),
  getMyReferrals: () => api.get("/alumni/referrals"),
  deleteReferral: (id) => api.delete(`/alumni/referrals/${id}`),
};

// ============ JOBS ============
export const jobAPI = {
  createJob: (data) => api.post("/jobs", data),
  getMyJobs: (params) => api.get("/jobs/my-postings", { params }), // path differs from /jobs/my-jobs/all
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getAllJobs: (params) => api.get("/jobs", { params }), // server auto-filters by student's own eligibility
  getJobById: (id) => api.get(`/jobs/${id}`),
};

// ============ APPLICATIONS ============
export const applicationAPI = {
  applyForJob: (data) => api.post(`/jobs/apply/${data.jobId}`, { coverLetter: data.coverLetter }),
  getMyApplications: (params) => api.get("/jobs/my-applications", { params }), // path differs
  getApplicationById: (id) => api.get(`/applications/${id}`),
  withdrawApplication: (id) => api.delete(`/applications/${id}`),

  // Deliberately not built on backend — recruiters view applications per-job only.
  getRecruiterApplications: () =>
    Promise.reject({ response: { data: { message: "Not available — view applications per job instead." } } }),

  getJobApplications: (jobId, params) => api.get(`/jobs/${jobId}/applications`, { params }), // nests under /jobs
  updateApplicationStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  bulkUpdateApplications: (data) => api.post("/applications/bulk-update", data), // verb differs: POST not PATCH
  recalculateATSScores: (jobId) => api.post(`/jobs/${jobId}/calculate-scores`), // nests under /jobs
};

// ============ UPLOAD ============
export const uploadAPI = {
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append("file", file); // field name differs from original "photo"
    return api.post("/student/profile-photo", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("file", file); // field name differs from original "resume"
    return api.post("/student/resume", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  deletePhoto: () => api.delete("/student/profile-photo"),
  deleteResume: () => api.delete("/student/resume"),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append("file", file); // field name differs from original "logo"
    return api.post("/recruiter/logo", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

// ============ NOTIFICATIONS ============
export const notificationAPI = {
  getNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.post(`/notifications/${id}/read`), // verb differs: POST not PUT
  markAllAsRead: () => api.post("/notifications/read-all"), // verb differs
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete("/notifications/clear-read"),
};

// ============ ANALYTICS (new module — original had this too, we now match it) ============
export const analyticsAPI = {
  getStudentDashboard: () => api.get("/analytics/student/dashboard"),
  getRecruiterDashboard: () => api.get("/analytics/recruiter/dashboard"),
  getAdminDashboard: () => api.get("/analytics/admin/dashboard"),
  getAdvanced: (params) => api.get("/analytics/admin/advanced", { params }),
  exportData: (params) => api.get("/analytics/admin/export", { params }),
};

// ============ FEED (merged in from feedAPI.js) ============
export const feedAPI = {
  createPost: (formData) => api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getFeed: (params = {}) => api.get("/posts", { params }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, formData) => api.put(`/posts/${postId}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  pinPost: (postId) => api.post(`/posts/${postId}/pin`), // verb differs: POST not PUT
  unpinPost: (postId) => api.post(`/posts/${postId}/unpin`), // verb differs
  trackView: (postId) => api.post(`/posts/${postId}/view`),
  getAnalytics: (postId) => api.get(`/posts/analytics/${postId}`),
  removeImage: (postId, imageId) => api.delete(`/posts/${postId}/image/${imageId}`), // shape differs: imageId in path, not publicId in body
  removeDocument: (postId, documentId) => api.delete(`/posts/${postId}/document/${documentId}`),
};

export default api;








//Below code is commented out because it was used for the backend built on Node.js and Express.js. The current backend is built on Spring boot, so the API calls are handled differently. The code is kept for reference in case we need to switch back to the previous backend or for understanding the structure of API calls.
/* import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
let isRedirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status } = error.response;
    const requestUrl = error.config?.url || "";

    // Skip auth endpoints (login/register)
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    // Handle expired token safely
    if (status === 401 && !isAuthRequest) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        toast.error("Session expired. Please login again.");

        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      }
    } else if (status === 403) {
      toast.error(error.response.data.message || "Access denied");
    } else {
      const message = error.response.data?.message || "Something went wrong";
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

// ============ AUTH APIs ============

export const authAPI = {
  // Login
  login: (credentials) => api.post("/auth/login", credentials),

  // Register Student
  registerStudent: (data) => api.post("/auth/register/student", data),

  // Register Recruiter
  registerRecruiter: (data) => api.post("/auth/register/recruiter", data),

  // Register Admin
  registerAdmin: (data) => api.post("/auth/register/admin", data),

  // Register Alumni
  registerAlumni: (data) => api.post("/auth/register/alumni", data),
};

// ============ STUDENT APIs ============

export const studentAPI = {
  // Get profile
  getProfile: () => api.get("/student/profile"),

  // Update profile
  updateProfile: (data) => api.put("/student/profile", data),

  // Get profile completion
  getProfileCompletion: () => api.get("/student/profile/completion"),
  getDashboard: () => api.get("/student/dashboard"),
  requestExtension: (reason) =>
    api.post("/student/request-extension", { reason }),

  // Placements
  getPlacements: () => api.get("/student/placements"),
  getReferrals: () => api.get("/student/referrals"),
};

// ============ RECRUITER APIs ============

export const recruiterAPI = {
  // Get profile
  getProfile: () => api.get("/recruiter/profile"),

  // Update profile
  updateProfile: (data) => api.put("/recruiter/profile", data),

  exportJobApplications: (jobId, status = "all") =>
    api.get(`/applications/job/${jobId}/export`, {
      params: { status },
      responseType: "blob",
    }),
  autoShortlistByATS: (jobId, threshold) =>
    api.post(`/applications/job/${jobId}/auto-shortlist`, { threshold }),
};

// ============ ADMIN APIs ============

export const adminAPI = {
  // Get profile
  getProfile: () => api.get("/admin/profile"),

  // Update profile
  updateProfile: (data) => api.put("/admin/profile", data),

  // Get dashboard stats
  getDashboardStats: () => api.get("/admin/dashboard/stats"),

  // Recruiter management
  getAllRecruiters: (params) => api.get("/admin/recruiters", { params }),
  getPendingRecruiters: () => api.get("/admin/recruiters/pending"),
  verifyRecruiter: (id, data) =>
    api.put(`/admin/recruiters/${id}/verify`, data),

  // Alumni management
  getAllAlumni: (params) => api.get("/admin/alumni", { params }),
  getPendingAlumni: () => api.get("/admin/alumni/pending"),
  verifyAlumni: (id, data) => api.put(`/admin/alumni/${id}/verify`, data),

  // Student management
  getAllStudents: (params) => api.get("/admin/students", { params }),

  // Jobs
  getAllJobs: (params) => api.get("/admin/jobs", { params }),
  getPendingJobs: () => api.get("/admin/jobs/pending"),
  verifyJob: (id, data) => api.put(`/admin/jobs/${id}/verify`, data),

  // Applications
  getAllApplications: (params) => api.get("/admin/applications", { params }),
  getExtensionRequests: (status) =>
    api.get("/admin/extension-requests", { params: { status } }),

  getExtensionStats: () => api.get("/admin/extension-requests/stats"),

  reviewExtensionRequest: (studentId, requestId, action, extensionDays) =>
    api.post(`/admin/extension-requests/${studentId}/${requestId}/review`, {
      action,
      extensionDays,
    }),

  getJobDetails: (jobId) => api.get(`/admin/jobs/${jobId}`),
  adminUpdateApplicationStatus: (applicationId, data) =>
    api.put(`/admin/applications/${applicationId}/status`, data),
  exportJobApplications: (jobId, status = "all") =>
    api.get(`/admin/jobs/${jobId}/export`, {
      params: { status },
      responseType: "blob",
    }),
  bulkUpdateApplications: (data) =>
    api.patch("/admin/applications/bulk-update", data),

  createAdmin: (data) => api.post("/admin/admins", data),

  getAllAdmins: () => api.get("/admin/admins"),

  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  getPendingReferrals: () => api.get("/admin/referrals/pending"),

  getAllReferrals: () => api.get("/admin/referrals"),

  verifyReferral: (id, action) =>
    api.put(`/admin/referrals/${id}/verify`, { action }),
};

// ============ ALUMNI APIs ============

export const alumniAPI = {
  // Get profile
  getProfile: () => api.get("/alumni/profile"),

  // Update profile
  updateProfile: (data) => api.put("/alumni/profile", data),

  createReferral: (data) => api.post("/alumni/referrals", data),
  getMyReferrals: () => api.get("/alumni/referrals"),
  deleteReferral: (id) => api.delete(`/alumni/referrals/${id}`),
};

// Job APIs
export const jobAPI = {
  // Recruiter
  createJob: (data) => api.post("/jobs", data),
  getMyJobs: (params) => api.get("/jobs/my-jobs/all", { params }),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),

  // Student
  getAllJobs: (params) => api.get("/jobs", { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
};

// Application APIs
export const applicationAPI = {
  // Student
  applyForJob: (data) => api.post("/applications", data),
  getMyApplications: (params) =>
    api.get("/applications/my-applications", { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  withdrawApplication: (id) => api.delete(`/applications/${id}`),

  // Recruiter
  getRecruiterApplications: (params) =>
    api.get("/applications/recruiter/all", { params }),
  getJobApplications: (jobId, params) =>
    api.get(`/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (id, data) =>
    api.put(`/applications/${id}/status`, data),
  bulkUpdateApplications: (data) =>
    api.patch("/applications/bulk-update", data),
  recalculateATSScores: (jobId, data) =>
    api.post(`/applications/job/${jobId}/calculate-scores`, data),
};

//upload APIs
export const uploadAPI = {
  // Student
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return api.post("/upload/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api.post("/upload/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deletePhoto: () => api.delete("/upload/photo"),
  deleteResume: () => api.delete("/upload/resume"),

  // Recruiter
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append("logo", file);
    return api.post("/upload/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete("/notifications/clear-read"),
};

export default api;
 */