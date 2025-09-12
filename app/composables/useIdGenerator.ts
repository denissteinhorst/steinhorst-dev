/**
 * Composable for generating safe and unique HTML element IDs
 * Handles special characters and ensures WCAG compliance for ARIA references
 */
export const useIdGenerator = () => {
  /**
   * Creates a safe HTML ID from text by removing/replacing special characters
   * Ensures the ID is valid for use with aria-labelledby and aria-describedby
   *
   * @param text - The text to convert to a safe ID
   * @param prefix - Optional prefix for the ID (default: empty)
   * @param index - Optional index to ensure uniqueness
   * @returns A safe HTML ID string
   */
  const createSafeId = (text: string, prefix = '', index?: number): string => {
    const baseId = text
      .toLowerCase()
      .replace(/[&()]/g, '') // Remove &, (, ) characters
      .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

    const prefixPart = prefix ? `${prefix}-` : ''
    const indexPart = index !== undefined ? `-${index}` : ''

    return `${prefixPart}${baseId}${indexPart}`
  }

  /**
   * Generates a unique ID based on component name and content
   *
   * @param componentName - The name of the component (e.g., 'skill', 'project')
   * @param content - The content to base the ID on
   * @param index - Optional index for uniqueness
   * @returns A unique component ID
   */
  const generateComponentId = (componentName: string, content: string, index?: number): string => {
    return createSafeId(content, componentName, index)
  }

  return {
    createSafeId,
    generateComponentId,
  }
}
