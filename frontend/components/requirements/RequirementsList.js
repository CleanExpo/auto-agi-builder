import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RequirementFilterBar from './RequirementFilterBar';
import RequirementItem from './RequirementItem';
import { useUI } from '../../contexts/UIContext';
import { useProject } from '../../contexts/ProjectContext';

/**
 * RequirementsList Component
 * Container component for displaying, filtering, and managing requirements
 */
export default function RequirementsList({ projectId = null }) {
  const router = useRouter();
  const { id } = router.query;
  const { getRequirements, loading: projectLoading } = useProject();
  const { showModal } = useUI();

  // Local state
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    statuses: [],
    types: [],
    priorities: [],
    tags: [],
    sortBy: 'updated',
    sortOrder: 'desc'
  });

  // Track expanded requirements
  const [expandedRequirements, setExpandedRequirements] = useState({});

  // Fetch requirements on mount and when filters change
  useEffect(() => {
    fetchRequirements();
  }, [projectId, id]);

  // Fetch requirements
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const projectIdentifier = projectId || id;
      
      if (!projectIdentifier) {
        setLoading(false);
        return;
      }
      
      const data = await getRequirements(projectIdentifier);
      setRequirements(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError('Failed to load requirements. Please try again.');
      setLoading(false);
    }
  };

  // Handle filter changes from FilterBar
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Filter and sort requirements based on applied filters
  const getFilteredRequirements = () => {
    if (!requirements || !requirements.length) {
      return [];
    }

    return requirements
      .filter(requirement => {
        // Search query filter
        if (filters.searchQuery && !requirementMatchesSearch(requirement, filters.searchQuery)) {
          return false;
        }
        
        // Status filter
        if (filters.statuses.length > 0 && !filters.statuses.includes(requirement.status)) {
          return false;
        }
        
        // Type filter
        if (filters.types.length > 0 && !filters.types.includes(requirement.type)) {
          return false;
        }
        
        // Priority filter
        if (filters.priorities.length > 0 && !filters.priorities.includes(requirement.priority)) {
          return false;
        }
        
        // Tags filter
        if (filters.tags.length > 0 && !requirementHasTags(requirement, filters.tags)) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by selected field
        switch (filters.sortBy) {
          case 'title':
            return sortByString(a.title, b.title, filters.sortOrder);
          case 'priority':
            return sortByPriority(a.priority, b.priority, filters.sortOrder);
          case 'status':
            return sortByString(a.status, b.status, filters.sortOrder);
          case 'created':
            return sortByDate(a.createdAt, b.createdAt, filters.sortOrder);
          case 'updated':
            return sortByDate(a.updatedAt || a.createdAt, b.updatedAt || b.createdAt, filters.sortOrder);
          case 'storyPoints':
            return sortByNumber(a.storyPoints || 0, b.storyPoints || 0, filters.sortOrder);
          default:
            return 0;
        }
      });
  };

  // Toggle expanded state of a requirement
  const toggleExpand = (requirementId) => {
    setExpandedRequirements(prev => ({
      ...prev,
      [requirementId]: !prev[requirementId]
    }));
  };

  // Helper: Check if requirement matches search query
  const requirementMatchesSearch = (requirement, query) => {
    if (!query) return true;
    
    const lowerQuery = query.toLowerCase();
    return (
      (requirement.title && requirement.title.toLowerCase().includes(lowerQuery)) ||
      (requirement.description && requirement.description.toLowerCase().includes(lowerQuery)) ||
      (requirement.acceptanceCriteria && requirement.acceptanceCriteria.toLowerCase().includes(lowerQuery)) ||
      (requirement.tags && requirement.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  };

  // Helper: Check if requirement has at least one of the selected tags
  const requirementHasTags = (requirement, selectedTags) => {
    if (!requirement.tags || !requirement.tags.length) return false;
    return selectedTags.some(tag => requirement.tags.includes(tag));
  };

  // Helper: Sort by string value
  const sortByString = (a, b, order) => {
    if (!a && !b) return 0;
    if (!a) return order === 'asc' ? 1 : -1;
    if (!b) return order === 'asc' ? -1 : 1;
    
    const comparison = a.localeCompare(b);
    return order === 'asc' ? comparison : -comparison;
  };

  // Helper: Sort by date
  const sortByDate = (a, b, order) => {
    if (!a && !b) return 0;
    if (!a) return order === 'asc' ? 1 : -1;
    if (!b) return order === 'asc' ? -1 : 1;
    
    const dateA = new Date(a);
    const dateB = new Date(b);
    
    const comparison = dateA - dateB;
    return order === 'asc' ? comparison : -comparison;
  };

  // Helper: Sort by number
  const sortByNumber = (a, b, order) => {
    if (a === b) return 0;
    const comparison = a - b;
    return order === 'asc' ? comparison : -comparison;
  };

  // Helper: Sort by priority (custom order)
  const sortByPriority = (a, b, order) => {
    const priorityOrder = {
      'critical': 4, 
      'high': 3, 
      'medium': 2, 
      'low': 1
    };
    
    const priorityA = priorityOrder[a] || 0;
    const priorityB = priorityOrder[b] || 0;
    
    if (priorityA === priorityB) return 0;
    const comparison = priorityA - priorityB;
    return order === 'asc' ? comparison : -comparison;
  };

  // Handle add new requirement
  const handleAddRequirement = () => {
    showModal('requirementForm', { projectId: projectId || id, onClose: fetchRequirements });
  };

  // Filtered requirements based on current filters
  const filteredRequirements = getFilteredRequirements();

  if (loading || projectLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="requirements-list-container">
      {/* Filter Bar */}
      <RequirementFilterBar 
        onFilterChange={handleFilterChange}
        totalRequirements={requirements.length}
        defaultFilters={filters}
      />
      
      {/* Requirements List */}
      <div className="space-y-4">
        {/* Empty state */}
        {requirements.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No requirements yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating requirements for your project. Requirements help define what needs to be built and serve as the foundation for your project.
            </p>
            <button
              onClick={handleAddRequirement}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Your First Requirement
            </button>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No matching requirements</h3>
            <p className="text-gray-600">
              No requirements match your current filters. Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <>
            {/* Requirements list with actions header */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                Showing {filteredRequirements.length} of {requirements.length} requirements
              </p>
              <button
                onClick={handleAddRequirement}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Requirement
              </button>
            </div>
            
            {/* Requirements items */}
            <div className="requirements-grid space-y-4">
              {filteredRequirements.map(requirement => (
                <RequirementItem
                  key={requirement.id}
                  requirement={requirement}
                  isExpanded={!!expandedRequirements[requirement.id]}
                  toggleExpand={() => toggleExpand(requirement.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
