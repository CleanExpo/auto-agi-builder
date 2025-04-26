import axios from 'axios';
import { getAuthHeaders } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Phase API endpoints
export const createPhase = async (projectId, phaseData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/roadmap/projects/${projectId}/phases/`, 
      phaseData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating phase:', error);
    throw error;
  }
};

export const getProjectPhases = async (projectId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/roadmap/projects/${projectId}/phases/`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting project phases:', error);
    throw error;
  }
};

export const getPhase = async (phaseId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/roadmap/phases/${phaseId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting phase:', error);
    throw error;
  }
};

export const updatePhase = async (phaseId, phaseData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/roadmap/phases/${phaseId}`, 
      phaseData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating phase:', error);
    throw error;
  }
};

export const deletePhase = async (phaseId) => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(
      `${API_URL}/roadmap/phases/${phaseId}`,
      { headers }
    );
    return true;
  } catch (error) {
    console.error('Error deleting phase:', error);
    throw error;
  }
};

export const reorderPhases = async (projectId, phaseIds) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/roadmap/projects/${projectId}/phases/reorder`, 
      phaseIds,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error reordering phases:', error);
    throw error;
  }
};

// Milestone API endpoints
export const createMilestone = async (phaseId, milestoneData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/roadmap/phases/${phaseId}/milestones/`, 
      milestoneData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating milestone:', error);
    throw error;
  }
};

export const getPhaseMilestones = async (phaseId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/roadmap/phases/${phaseId}/milestones/`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting phase milestones:', error);
    throw error;
  }
};

export const getMilestone = async (milestoneId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/roadmap/milestones/${milestoneId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting milestone:', error);
    throw error;
  }
};

export const updateMilestone = async (milestoneId, milestoneData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/roadmap/milestones/${milestoneId}`, 
      milestoneData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating milestone:', error);
    throw error;
  }
};

export const deleteMilestone = async (milestoneId) => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(
      `${API_URL}/roadmap/milestones/${milestoneId}`,
      { headers }
    );
    return true;
  } catch (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
};

export const reorderMilestones = async (phaseId, milestoneIds) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/roadmap/phases/${phaseId}/milestones/reorder`, 
      milestoneIds,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error reordering milestones:', error);
    throw error;
  }
};

// Roadmap API endpoints
export const getProjectRoadmap = async (projectId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/roadmap/projects/${projectId}/roadmap`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting project roadmap:', error);
    throw error;
  }
};

export const generateDefaultRoadmap = async (projectId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/roadmap/projects/${projectId}/roadmap/generate-default`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating default roadmap:', error);
    throw error;
  }
};

// Export all functions as default object
const roadmapService = {
  // Phase methods
  createPhase,
  getProjectPhases,
  getPhase,
  updatePhase, 
  deletePhase,
  reorderPhases,
  
  // Milestone methods
  createMilestone,
  getPhaseMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestones,
  
  // Roadmap methods
  getProjectRoadmap,
  generateDefaultRoadmap
};

export default roadmapService;
