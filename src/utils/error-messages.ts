export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Map technical errors to user-friendly messages
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to ComfyUI. Please ensure it is running on localhost:8188';
    }
    if (error.message.includes('NetworkError') || error.message.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (error.message.includes('IndexedDB') || error.message.includes('database')) {
      return 'Database error. Try clearing your browser data or using a different browser.';
    }
    if (error.message.includes('quota') || error.message.includes('storage')) {
      return 'Storage quota exceeded. Please clear some data to continue.';
    }
    if (error.message.includes('CORS')) {
      return 'CORS error. Make sure ComfyUI is running with: python main.py --cors-allow-origins http://localhost:8080';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. The server may be busy, please try again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};
