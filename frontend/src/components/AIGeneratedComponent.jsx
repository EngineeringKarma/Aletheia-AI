// src/components/AIGeneratedComponent.jsx
import { useState, useEffect } from 'react';

export default function AIGeneratedComponent({ componentCode, componentName }) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (componentCode) {
      try {
        // Create a function from the component code
        const createComponent = new Function('React', 'useState', 'useEffect', `
          ${componentCode}
          return ${componentName || 'AIGeneratedComponent'};
        `);
        
        const Comp = createComponent(React, useState, useEffect);
        setComponent(() => Comp);
      } catch (err) {
        console.error('Error creating component:', err);
        setError(err.message);
      }
    }
  }, [componentCode, componentName]);

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
        <h3 className="text-red-400 font-bold">Component Error</h3>
        <pre className="text-sm mt-2">{error}</pre>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="animate-pulse">Loading AI-generated component...</div>
      </div>
    );
  }

  return <Component />;
}