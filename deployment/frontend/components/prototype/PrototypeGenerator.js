import React, { useState, useEffect } from 'react';

// Simplified PrototypeGenerator component
const PrototypeGenerator = () => {
  const [templates, setTemplates] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load templates from API
  const loadTemplates = async () => {
    try {
      // Simulated API response
      const mockTemplates = [
        { id: 1, name: 'Web Application', description: 'A template for web applications', category: 'Web' },
        { id: 2, name: 'Mobile App', description: 'A template for mobile applications', category: 'Mobile' },
        { id: 3, name: 'API Service', description: 'A template for API services', category: 'Backend' }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates');
    }
  };

  // Load user projects from API
  const loadUserProjects = async () => {
    try {
      // Simulated API response
      const mockProjects = [
        { id: 101, name: 'My Web App', template: 'Web Application', createdAt: '2025-04-01' },
        { id: 102, name: 'Mobile Game', template: 'Mobile App', createdAt: '2025-04-15' }
      ];
      setUserProjects(mockProjects);
    } catch (error) {
      console.error('Error loading user projects:', error);
      setError('Failed to load your projects');
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      // Simulated API response
      return {
        totalProjects: 12,
        completedProjects: 8,
        activeUsers: 42,
        averageCompletionTime: '3.5 days'
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  };

  // Initialize data
  useEffect(() => {
    loadTemplates();
    loadUserProjects();
  }, []);

  // Create a new project
  const createProject = async (projectData) => {
    setLoading(true);
    try {
      // In a real implementation this would be an API call
      console.log('Creating project with data:', projectData);
      
      // Simulated API response
      const newProject = {
        id: Math.floor(Math.random() * 1000),
        name: projectData.name,
        template: projectData.template,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setUserProjects([...userProjects, newProject]);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prototype-generator">
      <h1>Auto AGI Builder</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="project-templates">
        <h2>Templates</h2>
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <span className="category">{template.category}</span>
          </div>
        ))}
      </div>
      
      <div className="user-projects">
        <h2>Your Projects</h2>
        {userProjects.map(project => (
          <div key={project.id} className="project-card">
            <h3>{project.name}</h3>
            <p>Template: {project.template}</p>
            <p>Created: {project.createdAt}</p>
          </div>
        ))}
      </div>
      
      {loading && <div className="loading-spinner">Loading...</div>}
    </div>
  );
};

export default PrototypeGenerator;
