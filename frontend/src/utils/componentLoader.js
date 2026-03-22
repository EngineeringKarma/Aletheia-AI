// src/utils/componentLoader.js
export async function loadAIGeneratedComponent(componentCode, componentName = 'DynamicComponent') {
  try {
    // Clean the code
    const cleanCode = componentCode
      .replace(/```jsx/g, '')
      .replace(/```javascript/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Create a blob URL for the component
    const blob = new Blob([`
      import React, { useState, useEffect } from 'react';
      ${cleanCode}
      export default ${componentName};
    `], { type: 'application/javascript' });
    
    const url = URL.createObjectURL(blob);
    const module = await import(url);
    URL.revokeObjectURL(url);
    
    return module.default;
  } catch (error) {
    console.error('Error loading AI component:', error);
    throw error;
  }
}