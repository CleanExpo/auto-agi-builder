import { useUI } from '../contexts/UIContext';

// Force server-side rendering instead of static generation
export async function getServerSideProps() {
  return {
    props: {} // will be passed to the page component as props
  }
}

export default function Home() {
  const { theme, toggleTheme } = useUI();
  
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: theme === 'light' ? '#ffffff' : '#121212',
      color: theme === 'light' ? '#333333' : '#f5f5f5',
    }}>
      <h1>Auto AGI Builder</h1>
      <p>Successfully using UI Context with SSR-safe providers!</p>
      
      <button 
        onClick={toggleTheme}
        style={{
          padding: '10px 15px',
          margin: '20px 0',
          backgroundColor: theme === 'light' ? '#007bff' : '#0056b3',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Toggle Theme: Current is {theme}
      </button>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        border: '1px solid ' + (theme === 'light' ? '#dddddd' : '#444444'), 
        borderRadius: '8px' 
      }}>
        <h2>Deployment Notes</h2>
        <p>This is a minimal working deployment that demonstrates:</p>
        <ul style={{ textAlign: 'left' }}>
          <li>Successful Next.js build and Vercel deployment</li>
          <li><strong>Properly working UI Context with SSR safety!</strong></li>
          <li>No "useUI must be used within a UIProvider" errors</li>
          <li>Model Context Protocol integration for robust provider system</li>
        </ul>
      </div>
    </div>
  );
}
