// API Configuration
import currentConfig from './networkConfig';

const API_BASE_URL = currentConfig.API_BASE_URL;
const API_TIMEOUT = currentConfig.TIMEOUT;

// API Endpoints
const ENDPOINTS = {
  HEALTH: '/health',
  GRADE: '/grade',
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to create headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.HEALTH}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Grade pronunciation endpoint
  async gradePronunciation(videoFile, phoneme) {
    try {
      console.log('Uploading video:', videoFile);
      console.log('Phoneme:', phoneme);
      
      const formData = new FormData();
      
      // Create proper file object for React Native
      const fileToUpload = {
        uri: videoFile.uri,
        type: videoFile.type || 'video/mp4',
        name: videoFile.name || 'video.mp4',
      };
      
      formData.append('video', fileToUpload);
      formData.append('phoneme', phoneme);

      console.log('FormData created, sending request to:', `${this.baseURL}${ENDPOINTS.GRADE}`);

      const response = await fetch(`${this.baseURL}${ENDPOINTS.GRADE}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      return this.handleResponse(response);
    } catch (error) {
      console.error('Grade pronunciation failed:', error);
      throw error;
    }
  }

  // Test connection to backend
  async testConnection() {
    try {
      const result = await this.healthCheck();
      console.log('Backend connection successful:', result);
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
