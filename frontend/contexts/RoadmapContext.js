import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import roadmapService from '../services/roadmapService';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

// Create context
const RoadmapContext = createContext();

export const RoadmapProvider = ({ children }) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { isAuthenticated } = useAuth();
  
  const [roadmap, setRoadmap] = useState(null);
  const [phases, setPhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Get current project ID from router query
  const projectId = router.query.id;

  // Reset context when project changes
  useEffect(() => {
    if (projectId && isAuthenticated) {
      fetchProjectRoadmap(projectId);
    } else {
      resetContext();
    }
    
    return () => {
      // Clean up when unmounting
      resetContext();
    };
  }, [projectId, isAuthenticated]);
  
  // Reset context state
  const resetContext = useCallback(() => {
    setRoadmap(null);
    setPhases([]);
    setCurrentPhase(null);
    setCurrentMilestone(null);
    setMilestones([]);
    setLoading(false);
    setError(null);
    setIsDirty(false);
  }, []);
  
  // Fetch complete roadmap for a project
  const fetchProjectRoadmap = useCallback(async (projectId) => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await roadmapService.getProjectRoadmap(projectId);
      setRoadmap(data);
      setPhases(data.phases || []);
      setIsDirty(false);
    } catch (err) {
      console.error('Error fetching project roadmap:', err);
      setError('Failed to load roadmap. Please try again later.');
      showNotification('error', 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Generate default roadmap for a project
  const generateDefaultRoadmap = useCallback(async (projectId) => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await roadmapService.generateDefaultRoadmap(projectId);
      setRoadmap(data);
      setPhases(data.phases || []);
      setIsDirty(false);
      showNotification('success', 'Default roadmap generated successfully');
    } catch (err) {
      console.error('Error generating default roadmap:', err);
      setError('Failed to generate roadmap. Please try again later.');
      showNotification('error', 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Fetch phases for a project
  const fetchProjectPhases = useCallback(async (projectId) => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await roadmapService.getProjectPhases(projectId);
      setPhases(data);
    } catch (err) {
      console.error('Error fetching project phases:', err);
      setError('Failed to load phases. Please try again later.');
      showNotification('error', 'Failed to load phases');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Create a new phase
  const createPhase = useCallback(async (projectId, phaseData) => {
    if (!projectId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newPhase = await roadmapService.createPhase(projectId, phaseData);
      setPhases(prev => [...prev, newPhase]);
      setIsDirty(true);
      showNotification('success', 'Phase created successfully');
      return newPhase;
    } catch (err) {
      console.error('Error creating phase:', err);
      setError('Failed to create phase. Please try again later.');
      showNotification('error', 'Failed to create phase');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Update a phase
  const updatePhase = useCallback(async (phaseId, phaseData) => {
    if (!phaseId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedPhase = await roadmapService.updatePhase(phaseId, phaseData);
      setPhases(prev => prev.map(phase => phase.id === phaseId ? updatedPhase : phase));
      if (currentPhase && currentPhase.id === phaseId) {
        setCurrentPhase(updatedPhase);
      }
      setIsDirty(true);
      showNotification('success', 'Phase updated successfully');
      return updatedPhase;
    } catch (err) {
      console.error('Error updating phase:', err);
      setError('Failed to update phase. Please try again later.');
      showNotification('error', 'Failed to update phase');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentPhase, showNotification]);
  
  // Delete a phase
  const deletePhase = useCallback(async (phaseId) => {
    if (!phaseId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await roadmapService.deletePhase(phaseId);
      setPhases(prev => prev.filter(phase => phase.id !== phaseId));
      if (currentPhase && currentPhase.id === phaseId) {
        setCurrentPhase(null);
      }
      setIsDirty(true);
      showNotification('success', 'Phase deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting phase:', err);
      setError('Failed to delete phase. Please try again later.');
      showNotification('error', 'Failed to delete phase');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentPhase, showNotification]);
  
  // Reorder phases
  const reorderPhases = useCallback(async (projectId, phaseIds) => {
    if (!projectId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedPhases = await roadmapService.reorderPhases(projectId, phaseIds);
      setPhases(updatedPhases);
      setIsDirty(true);
      return true;
    } catch (err) {
      console.error('Error reordering phases:', err);
      setError('Failed to reorder phases. Please try again later.');
      showNotification('error', 'Failed to reorder phases');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Fetch milestones for a phase
  const fetchPhaseMilestones = useCallback(async (phaseId) => {
    if (!phaseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await roadmapService.getPhaseMilestones(phaseId);
      setMilestones(data);
    } catch (err) {
      console.error('Error fetching phase milestones:', err);
      setError('Failed to load milestones. Please try again later.');
      showNotification('error', 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Set current phase and load its milestones
  const selectPhase = useCallback(async (phaseId) => {
    if (!phaseId) {
      setCurrentPhase(null);
      setMilestones([]);
      return;
    }
    
    const phase = phases.find(p => p.id === phaseId);
    if (phase) {
      setCurrentPhase(phase);
      await fetchPhaseMilestones(phaseId);
    }
  }, [phases, fetchPhaseMilestones]);
  
  // Create a new milestone
  const createMilestone = useCallback(async (phaseId, milestoneData) => {
    if (!phaseId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newMilestone = await roadmapService.createMilestone(phaseId, milestoneData);
      setMilestones(prev => [...prev, newMilestone]);
      setIsDirty(true);
      showNotification('success', 'Milestone created successfully');
      return newMilestone;
    } catch (err) {
      console.error('Error creating milestone:', err);
      setError('Failed to create milestone. Please try again later.');
      showNotification('error', 'Failed to create milestone');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Update a milestone
  const updateMilestone = useCallback(async (milestoneId, milestoneData) => {
    if (!milestoneId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedMilestone = await roadmapService.updateMilestone(milestoneId, milestoneData);
      setMilestones(prev => prev.map(milestone => milestone.id === milestoneId ? updatedMilestone : milestone));
      if (currentMilestone && currentMilestone.id === milestoneId) {
        setCurrentMilestone(updatedMilestone);
      }
      setIsDirty(true);
      showNotification('success', 'Milestone updated successfully');
      return updatedMilestone;
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError('Failed to update milestone. Please try again later.');
      showNotification('error', 'Failed to update milestone');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentMilestone, showNotification]);
  
  // Delete a milestone
  const deleteMilestone = useCallback(async (milestoneId) => {
    if (!milestoneId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await roadmapService.deleteMilestone(milestoneId);
      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
      if (currentMilestone && currentMilestone.id === milestoneId) {
        setCurrentMilestone(null);
      }
      setIsDirty(true);
      showNotification('success', 'Milestone deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError('Failed to delete milestone. Please try again later.');
      showNotification('error', 'Failed to delete milestone');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentMilestone, showNotification]);
  
  // Reorder milestones
  const reorderMilestones = useCallback(async (phaseId, milestoneIds) => {
    if (!phaseId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedMilestones = await roadmapService.reorderMilestones(phaseId, milestoneIds);
      setMilestones(updatedMilestones);
      setIsDirty(true);
      return true;
    } catch (err) {
      console.error('Error reordering milestones:', err);
      setError('Failed to reorder milestones. Please try again later.');
      showNotification('error', 'Failed to reorder milestones');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Set current milestone
  const selectMilestone = useCallback((milestoneId) => {
    if (!milestoneId) {
      setCurrentMilestone(null);
      return;
    }
    
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      setCurrentMilestone(milestone);
    }
  }, [milestones]);
  
  // Create value object with all context functions and state
  const value = {
    roadmap,
    phases,
    currentPhase,
    milestones,
    currentMilestone,
    loading,
    error,
    isDirty,
    
    // Roadmap functions
    fetchProjectRoadmap,
    generateDefaultRoadmap,
    
    // Phase functions
    fetchProjectPhases,
    createPhase,
    updatePhase,
    deletePhase,
    reorderPhases,
    selectPhase,
    
    // Milestone functions
    fetchPhaseMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones,
    selectMilestone,
    
    // Utility functions
    resetContext
  };
  
  return (
    <RoadmapContext.Provider value={value}>
      {children}
    </RoadmapContext.Provider>
  );
};

// Custom hook to use the roadmap context
export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  
  if (context === undefined) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  
  return context;
};

export default RoadmapContext;
