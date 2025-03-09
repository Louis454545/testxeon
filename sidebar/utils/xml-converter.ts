/**
 * Converts an accessibility tree object into an XML-like string
 * This replaces the functionality of the xml_converter.py in the backend
 * 
 * @param accessibilityTree - The accessibility tree object from Chrome debugger
 * @returns XML string representation
 */
export function convertAccessibilityTree(accessibilityTree: any): string {
  try {
    if (!accessibilityTree || typeof accessibilityTree !== 'object') {
      return 'Invalid accessibility tree data';
    }

    if (typeof accessibilityTree === 'string') {
      try {
        accessibilityTree = JSON.parse(accessibilityTree);
      } catch (e) {
        return accessibilityTree; // Return as is if not JSON
      }
    }

    // For simplicity we'll just return the JSON as is 
    // The backend doesn't actually convert to XML but keeps the JSON structure
    // In a more complex implementation, we could convert to an XML format
    return JSON.stringify(accessibilityTree, null, 2);
  } catch (error) {
    console.error('Error converting accessibility tree to XML:', error);
    return 'Error converting accessibility tree data';
  }
} 