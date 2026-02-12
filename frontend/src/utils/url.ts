/**
 * Utility to generate full URLs for media files served by the backend.
 * Handles both development (localhost:8000) and production environments.
 */
export const getMediaUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Get base URL from environment or default to localhost:8000
    // We strip /api to get the root URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const baseUrl = API_URL.replace('/api', '').replace(/\/$/, ''); // Remove trailing slash

    // Ensure path starts with /
    // If backend returns 'resources/file.pdf', we need '/media/resources/file.pdf'
    // But usually FileField returns 'resources/file.pdf' (relative to MEDIA_ROOT)
    // AND we serving it at /media/

    // Check if path already starts with /media
    if (path.startsWith('/media/')) {
        return `${baseUrl}${path}`;
    }

    // If path starts with /, just prepend base
    if (path.startsWith('/')) {
        return `${baseUrl}${path}`;
    }

    // Otherwise assume it needs /media/ prefix
    return `${baseUrl}/media/${path}`;
};
