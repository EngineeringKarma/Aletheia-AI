// src/utils/componentExporter.js
export function exportComponent(componentCode, componentName) {
  const blob = new Blob([componentCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${componentName}.jsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importComponent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}