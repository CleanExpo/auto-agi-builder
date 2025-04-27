/**
 * Empty Context Mocks
 * 
 * This file contains mock implementations of all context hooks used in the application.
 * These mocks are used during server-side rendering to prevent "useX must be used within a Provider" errors.
 * 
 * They provide safe default values that won't cause errors during SSR, while the real
 * implementations will be used on the client side.
 */

// UI Context mock
export const useUI = () => ({
  theme: 'light',
  toggleTheme: () => {},
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
  isModalOpen: false,
  modalContent: null,
  openModal: () => {},
  closeModal: () => {},
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
});

// Auth Context mock
export const useAuth = () => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  verifyEmail: async () => ({ success: false }),
  sendPasswordResetEmail: async () => ({ success: false }),
});

// Project Context mock
export const useProject = () => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  getProjects: async () => [],
  getProject: async () => null,
  createProject: async () => ({ success: false }),
  updateProject: async () => ({ success: false }),
  deleteProject: async () => ({ success: false }),
  setCurrentProject: () => {},
});

// Client Context mock
export const useClient = () => ({
  clients: [],
  currentClient: null,
  loading: false,
  error: null,
  getClients: async () => [],
  getClient: async () => null,
  createClient: async () => ({ success: false }),
  updateClient: async () => ({ success: false }),
  deleteClient: async () => ({ success: false }),
  setCurrentClient: () => {},
});

// Requirement Context mock
export const useRequirement = () => ({
  requirements: [],
  loading: false,
  error: null,
  getRequirements: async () => [],
  getRequirement: async () => null,
  createRequirement: async () => ({ success: false }),
  updateRequirement: async () => ({ success: false }),
  deleteRequirement: async () => ({ success: false }),
  prioritizeRequirements: async () => ({ success: false }),
});

// Document Context mock
export const useDocument = () => ({
  documents: [],
  loading: false,
  error: null,
  getDocuments: async () => [],
  getDocument: async () => null,
  uploadDocument: async () => ({ success: false }),
  deleteDocument: async () => ({ success: false }),
});

// Prototype Context mock
export const usePrototype = () => ({
  prototypes: [],
  currentPrototype: null,
  loading: false,
  error: null,
  getPrototypes: async () => [],
  getPrototype: async () => null,
  createPrototype: async () => ({ success: false }),
  updatePrototype: async () => ({ success: false }),
  deletePrototype: async () => ({ success: false }),
  generatePrototype: async () => ({ success: false }),
  setCurrentPrototype: () => {},
});

// ROI Context mock
export const useROI = () => ({
  metrics: {},
  results: null,
  loading: false,
  error: null,
  calculateROI: async () => ({ success: false }),
  updateMetrics: () => {},
  saveROIReport: async () => ({ success: false }),
});

// Comment Context mock
export const useComment = () => ({
  comments: [],
  loading: false,
  error: null,
  getComments: async () => [],
  addComment: async () => ({ success: false }),
  updateComment: async () => ({ success: false }),
  deleteComment: async () => ({ success: false }),
});

// Roadmap Context mock
export const useRoadmap = () => ({
  roadmap: null,
  loading: false,
  error: null,
  getRoadmap: async () => null,
  updateRoadmap: async () => ({ success: false }),
  addMilestone: async () => ({ success: false }),
  updateMilestone: async () => ({ success: false }),
  deleteMilestone: async () => ({ success: false }),
});

// Collaboration Context mock
export const useCollaboration = () => ({
  collaborators: [],
  activeUsers: [],
  loading: false,
  error: null,
  joinSession: async () => ({ success: false }),
  leaveSession: async () => {},
  sendCursorPosition: () => {},
  sendMessage: async () => ({ success: false }),
});

// Notification Context mock
export const useNotification = () => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  getNotifications: async () => [],
  markAsRead: async () => ({ success: false }),
  deleteNotification: async () => ({ success: false }),
  subscribeToNotifications: () => ({ unsubscribe: () => {} }),
});

// Export all mocks in a single object
export default {
  useUI,
  useAuth,
  useProject,
  useClient,
  useRequirement,
  useDocument,
  usePrototype,
  useROI,
  useComment,
  useRoadmap,
  useCollaboration,
  useNotification,
};
