import React from 'react';
import Layout from '../components/Layout';
import { useUI } from '../contexts';

export default function Home() {
  const { showToast } = useUI();

  const handleGetStartedClick = () => {
    showToast('Starting your journey with AGI Auto Builder!', 'success');
  };

  const features = [
    {
      title: 'AI-Powered Development',
      description: 'Leverage the power of artificial intelligence to accelerate your development process and create innovative software solutions.',
      icon: '🧠'
    },
    {
      title: 'Visual Prototyping',
      description: 'Create interactive prototypes in minutes with our intuitive visual interface and smart component library.',
      icon: '🎨'
    },
    {
      title: 'Code Generation',
      description: 'Transform your ideas into production-ready code with our advanced code generation capabilities.',
      icon: '💻'
    },
    {
      title: 'Collaboration Tools',
      description: 'Work together seamlessly with team members using our real-time collaborative features and project management tools.',
      icon: '👥'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section style={{ 
        padding: '4rem 0', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #142239 100%)',
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1.5rem',
          background: 'linear-gradient(90deg, var(--secondary-color), var(--accent-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          AGI Auto Builder
        </h1>
        <p style={{ 
          fontSize: '1.5rem', 
          maxWidth: '800px',
          margin: '0 auto 2rem',
          lineHeight: '1.6'
        }}>
          Build intelligent applications faster with AI-powered tools and automated development workflows
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn btn-accent btn-large"
            onClick={handleGetStartedClick}
          >
            Get Started
          </button>
          <button className="btn btn-large">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '2rem',
          color: 'var(--secondary-color)'
        }}>
          Powerful Features
        </h2>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              style={{ 
                background: 'var(--card-bg-color)',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ 
        textAlign: 'center',
        marginTop: '4rem',
        padding: '3rem',
        background: 'var(--card-bg-color)',
        borderRadius: '10px'
      }}>
        <h2 style={{ 
          color: 'var(--secondary-color)', 
          marginBottom: '1rem',
          fontSize: '2rem'
        }}>
          Ready to revolutionize your development process?
        </h2>
        <p style={{ marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Join thousands of developers who are building the future with AGI Auto Builder.
        </p>
        <button className="btn btn-accent btn-large">
          Start Building Today
        </button>
      </section>
    </Layout>
  );
}
